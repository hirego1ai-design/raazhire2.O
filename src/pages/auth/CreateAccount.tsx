import React, { useState } from 'react';
import CandidateRegister from './CandidateRegister';
import EmployerRegister from './EmployerRegister';
import ToggleSwitch from '../../components/ToggleSwitch';

const CreateAccount: React.FC = () => {
    const [userType, setUserType] = useState<'candidate' | 'employer'>('candidate');

    return (
        <div className="relative min-h-screen bg-[#0a0e27]">
            {/* Floating Toggle Switch */}
            <div className="absolute top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <div className="pointer-events-auto shadow-2xl rounded-full">
                    <ToggleSwitch selected={userType} onChange={setUserType} />
                </div>
            </div>

            {/* Render Selected Registration Form */}
            <div className="pt-20 md:pt-0">
                {userType === 'candidate' ? (
                    <CandidateRegister />
                ) : (
                    <EmployerRegister />
                )}
            </div>
        </div>
    );
};

export default CreateAccount;
