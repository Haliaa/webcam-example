import "./App.css";
import { useState, useRef, useEffect } from "react";

function App() {
  const [playing, setPlaying] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [currentTime, setCurrentTime] = useState(0); // State to store current time
  const [captureTime, setCaptureTime] = useState(null); // State to store capture time
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const HEIGHT = 500;
  const WIDTH = 500;

  const startVideo = () => {
    setPlaying(true);
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then((stream) => {
        let video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          const track = stream.getVideoTracks()[0];
          const settings = track.getSettings();
          setVideoInfo(settings);
        }
      })
      .catch((err) => console.error(err));
  };

  const stopVideo = () => {
    setPlaying(false);
    setCapturedImage(null);
    let video = videoRef.current;
    if (video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, WIDTH, HEIGHT);
    const dataURL = canvas.toDataURL("image/png");

    // Get current time when image is captured
    const captureTime = video.currentTime;

    setCapturedImage(dataURL);
    setCaptureTime(captureTime);
  };

  // Function to update current time
  const updateTime = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  // Update current time every second when video is playing
  useEffect(() => {
    let intervalId;
    if (playing) {
      intervalId = setInterval(updateTime, 1000);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [playing]);

  // Listen to timeupdate event to update current time in real-time
  useEffect(() => {
    const video = videoRef.current;
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    if (video) {
      video.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, []);

  return (
    <div className="app">
      <div>
        📷 Your Privacy is Our Priority! We understand the importance of your
        privacy. Rest assured, when you allow access to your camera, your data
        stays safe and secure.
        <ul>
          Here's how:{" "}
          <li>
            🔒 Temporary Storage: Your camera data is not stored anywhere. It's
            only temporarily accessed by this site for the intended purpose.{" "}
          </li>
          <li>
            🔄 Auto-Deletion: Once you reload or leave the site, all camera data
            automatically disappears. It's as transient as your session.{" "}
          </li>
        </ul>
        Feel free to enjoy the features.
      </div>
      <div className="app__container">
        <video
          ref={videoRef}
          height={HEIGHT}
          width={WIDTH}
          muted
          autoPlay
          className="app__videoFeed"
          style={{ transform: "scaleX(-1)" }}
        ></video>
        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
          width={WIDTH}
          height={HEIGHT}
        ></canvas>
      </div>
      <div className="app__input">
        {playing ? (
          <>
            <button onClick={stopVideo}>End stream</button>
            <button onClick={captureFrame}>Capture Image</button>
          </>
        ) : (
          <button onClick={startVideo}>Start video stream</button>
        )}
      </div>
      {videoInfo && (
        <div className="app__info">
          <h3>Video Information:</h3>
          <p>
            Resolution: {videoInfo.width}x{videoInfo.height}
          </p>
          <p>Frame Rate: {videoInfo.frameRate}</p>
          <p>Aspect Ratio: {videoInfo.aspectRatio}</p>
          <p>Device ID: {videoInfo.deviceId}</p>
        </div>
      )}
      {playing && (
        <div className="app__current-time">
          <p>Current Time: {currentTime.toFixed(0)} seconds</p>
        </div>
      )}
      {capturedImage && (
        <div className="app__output">
          <h3>Captured Frame:</h3>
          <img src={capturedImage} alt="Captured Frame" />
          {captureTime && (
            <p>Captured Time: {captureTime.toFixed(0)} seconds</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
