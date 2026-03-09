import sys
try:
    import whisper
    import imageio_ffmpeg
    print("OK")
except ImportError as e:
    print(f"Error: {e}")
    sys.exit(1)
