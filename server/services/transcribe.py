import sys
import json
import os
import subprocess

# Auto-setup ffmpeg from imageio-ffmpeg if available
def setup_ffmpeg():
    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        ffmpeg_dir = os.path.dirname(ffmpeg_exe)
        
        # Add to PATH so subprocess.run(['ffmpeg']) works
        if ffmpeg_dir not in os.environ["PATH"]:
            os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ["PATH"]
            
        return ffmpeg_exe
    except ImportError:
        return None

setup_ffmpeg()

try:
    import whisper
except ImportError:
     # This will begin json output, so be careful. 
     # But main logic is wrapped. We'll handle this in main block if needed.
     pass

def check_dependencies():
    """Verify that FFmpeg is accessible"""
    try:
        # Check ffmpeg command availability
        subprocess.run(['ffmpeg', '-version'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False

def transcribe_audio(file_path, model_name="tiny"):
    """
    Transcribe audio file using OpenAI Whisper
    """
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}

    try:
        # Check dependencies
        if not check_dependencies():
             return {"error": "FFmpeg not found. Please ensure FFmpeg is installed and in PATH (or imageio-ffmpeg is installed via pip)."}

        # Lazy import whisper to avoid startup cost if ffmpeg missing
        import whisper
        
        print(f"Loading Whisper model '{model_name}'...", file=sys.stderr)
        model = whisper.load_model(model_name)
        
        print(f"Transcribing '{file_path}'...", file=sys.stderr)
        result = model.transcribe(file_path)
        
        return {
            "text": result["text"].strip(),
            "language": result.get("language", "en"),
            "segments": result.get("segments", [])
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python transcribe.py <audio_file_path> [model_name]"}));
        sys.exit(1)
        
    file_path = sys.argv[1]
    model = sys.argv[2] if len(sys.argv) > 2 else "tiny"
    
    result = transcribe_audio(file_path, model)
    print(json.dumps(result, indent=2))
