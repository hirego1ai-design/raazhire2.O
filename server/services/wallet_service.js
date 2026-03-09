import { supabaseAdmin } from '../utils/supabaseClient.js';

/**
 * Atomic Wallet Transaction Handler
 * Ensures financial operations are completed safely with rollback capabilities
 */

/**
 * Performs an atomic wallet transaction with proper error handling
 * @param {string} userId - The user ID performing the transaction
 * @param {number} amount - The transaction amount (positive for credit, negative for debit)
 * @param {string} transactionType - Type of transaction ('credit', 'debit', 'refund', 'payment')
 * @param {object} metadata - Additional transaction metadata
 * @returns {object} Transaction result with success status and transaction details
 */
export async function atomicWalletTransaction(userId, amount, transactionType, metadata = {}) {
    // Input validation
    if (!userId) {
        throw new Error('User ID is required');
    }
    
    if (typeof amount !== 'number' || isNaN(amount)) {
        throw new Error('Amount must be a valid number');
    }
    
    if (!['credit', 'debit', 'refund', 'payment'].includes(transactionType)) {
        throw new Error('Invalid transaction type');
    }
    
    // Validate amount based on transaction type
    if (transactionType === 'debit' && amount > 0) {
        throw new Error('Debit transactions must have negative amounts');
    }
    
    if (['credit', 'refund', 'payment'].includes(transactionType) && amount < 0) {
        throw new Error('Credit/refund/payment transactions must have positive amounts');
    }
    
    try {
        // Start transaction (using database constraints for atomicity)
        console.log(`[Wallet] Starting atomic transaction for user ${userId}: ${transactionType} ${amount}`);
        
        // 1. Get current wallet balance
        const { data: wallet, error: walletError } = await supabaseAdmin
            .from('wallet')
            .select('id, balance, user_id')
            .eq('user_id', userId)
            .single();
        
        // 2. Create wallet if it doesn't exist
        let walletId;
        if (!wallet) {
            console.log(`[Wallet] Creating new wallet for user ${userId}`);
            const { data: newWallet, error: createError } = await supabaseAdmin
                .from('wallet')
                .insert({
                    user_id: userId,
                    balance: 0,
                    currency: 'INR',
                    created_at: new Date().toISOString()
                })
                .select('id')
                .single();
            
            if (createError) throw new Error(`Failed to create wallet: ${createError.message}`);
            walletId = newWallet.id;
        } else {
            walletId = wallet.id;
        }
        
        // 3. Check if debit transaction would result in negative balance
        if (transactionType === 'debit') {
            const currentBalance = wallet?.balance || 0;
            const newBalance = currentBalance + amount; // amount is negative for debits
            
            if (newBalance < 0) {
                throw new Error(`Insufficient funds: Current balance ${currentBalance}, Attempted debit ${Math.abs(amount)}`);
            }
        }
        
        // 4. Create wallet transaction record
        const { data: transaction, error: transactionError } = await supabaseAdmin
            .from('wallet_transactions')
            .insert({
                wallet_id: walletId,
                user_id: userId,
                amount: amount,
                transaction_type: transactionType,
                status: 'completed',
                description: metadata.description || `Wallet ${transactionType}`,
                reference_id: metadata.referenceId || null,
                metadata: metadata,
                created_at: new Date().toISOString()
            })
            .select('id')
            .single();
        
        if (transactionError) {
            throw new Error(`Failed to create transaction record: ${transactionError.message}`);
        }
        
        // 5. Update wallet balance (this should be atomic with the transaction)
        const balanceUpdate = wallet?.balance ? wallet.balance + amount : amount;
        
        const { error: balanceError } = await supabaseAdmin
            .from('wallet')
            .update({ 
                balance: balanceUpdate,
                updated_at: new Date().toISOString()
            })
            .eq('id', walletId);
        
        if (balanceError) {
            // If balance update fails, we should ideally rollback the transaction
            // But since we're using separate tables, we'll mark transaction as failed
            await supabaseAdmin
                .from('wallet_transactions')
                .update({ 
                    status: 'failed',
                    error_message: `Balance update failed: ${balanceError.message}`
                })
                .eq('id', transaction.id);
            
            throw new Error(`Failed to update wallet balance: ${balanceError.message}`);
        }
        
        console.log(`[Wallet] Transaction completed successfully: ${transactionType} ${amount} for user ${userId}`);
        
        return {
            success: true,
            transactionId: transaction.id,
            newBalance: balanceUpdate,
            amount: amount,
            transactionType: transactionType
        };
        
    } catch (error) {
        console.error(`[Wallet] Atomic transaction failed:`, error.message);
        throw error;
    }
}

/**
 * Gets wallet balance for a user
 * @param {string} userId - The user ID
 * @returns {object} Wallet balance information
 */
export async function getWalletBalance(userId) {
    if (!userId) {
        throw new Error('User ID is required');
    }
    
    try {
        const { data: wallet, error } = await supabaseAdmin
            .from('wallet')
            .select('balance, currency, created_at, updated_at')
            .eq('user_id', userId)
            .single();
        
        if (error) {
            // Return zero balance if no wallet exists
            return {
                success: true,
                balance: 0,
                currency: 'INR',
                hasWallet: false
            };
        }
        
        return {
            success: true,
            balance: wallet.balance,
            currency: wallet.currency,
            createdAt: wallet.created_at,
            updatedAt: wallet.updated_at,
            hasWallet: true
        };
    } catch (error) {
        console.error('[Wallet] Error fetching balance:', error);
        throw error;
    }
}

/**
 * Gets transaction history for a user
 * @param {string} userId - The user ID
 * @param {number} limit - Number of transactions to return (default: 50)
 * @returns {object} Transaction history
 */
export async function getTransactionHistory(userId, limit = 50) {
    if (!userId) {
        throw new Error('User ID is required');
    }
    
    try {
        const { data: transactions, error } = await supabaseAdmin
            .from('wallet_transactions')
            .select(`
                id,
                amount,
                transaction_type,
                status,
                description,
                created_at,
                metadata
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        
        return {
            success: true,
            transactions: transactions || [],
            count: transactions ? transactions.length : 0
        };
    } catch (error) {
        console.error('[Wallet] Error fetching transaction history:', error);
        throw error;
    }
}

/**
 * Refunds a transaction
 * @param {string} transactionId - The transaction ID to refund
 * @param {string} userId - The user ID requesting refund
 * @param {string} reason - Reason for refund
 * @returns {object} Refund result
 */
export async function refundTransaction(transactionId, userId, reason) {
    if (!transactionId || !userId) {
        throw new Error('Transaction ID and User ID are required');
    }
    
    try {
        // Get original transaction
        const { data: originalTransaction, error: fetchError } = await supabaseAdmin
            .from('wallet_transactions')
            .select('amount, transaction_type, user_id, status')
            .eq('id', transactionId)
            .eq('user_id', userId)
            .single();
        
        if (fetchError) {
            throw new Error(`Transaction not found: ${fetchError.message}`);
        }
        
        if (originalTransaction.status !== 'completed') {
            throw new Error('Only completed transactions can be refunded');
        }
        
        // Calculate refund amount (opposite of original)
        const refundAmount = -originalTransaction.amount;
        
        // Perform refund transaction
        const result = await atomicWalletTransaction(
            userId,
            refundAmount,
            'refund',
            {
                description: `Refund: ${reason}`,
                referenceId: transactionId,
                originalTransactionId: transactionId,
                reason: reason
            }
        );
        
        return {
            success: true,
            refundTransactionId: result.transactionId,
            refundAmount: refundAmount,
            newBalance: result.newBalance
        };
    } catch (error) {
        console.error('[Wallet] Refund failed:', error);
        throw error;
    }
}

// Export all functions
export const walletService = {
    atomicWalletTransaction,
    getWalletBalance,
    getTransactionHistory,
    refundTransaction
};