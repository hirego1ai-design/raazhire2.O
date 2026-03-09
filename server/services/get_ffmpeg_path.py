try:
    import imageio_ffmpeg
    print(imageio_ffmpeg.get_ffmpeg_exe())
except ImportError:
    pass
except Exception:
    pass
