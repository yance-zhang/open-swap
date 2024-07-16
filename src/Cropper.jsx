import React, { useState, useRef, useContext } from "react";
import ThemeContext from "./ThemeContext";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import "./MyCircularCropper.css";
import { Box } from "@mui/material";
import uploadIcon from "./assets/cloud-upload.svg";
import uploadPic from "./assets/uploadPic.png";
import backIcon from "./assets/Back.svg";
import backIconWhite from "./assets/BackIcon-white.svg";

const MyCircularCropper = (props) => {
  const { goBack } = props;
  const [image, setImage] = useState(null);
  const cropperRef = useRef(null);
  const inputRef = useRef();
  const [showCrop, setShowCrop] = useState(false);
  const { goNext } = props;
  const theme = useContext(ThemeContext);

  const GobackButton = () => {
    return (
      <Box
        sx={{ position: "absolute", left: "32px", cursor: "pointer" }}
        onClick={goBack}
      >
        <img src={theme === "light" ? backIconWhite : backIcon} />
      </Box>
    );
  };

  const ConfirmButton = (props) => {
    const { color } = props;
    return (
      <Box
        sx={{
          width: "150px",
          height: "50px",
          borderRadius: "100px",
          background: color,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => {
          setShowCrop(false);
          goNext();
        }}
      >
        <Box
          sx={{
            color: color === "yellow" ? "#000" : "rgba(192, 200, 209, 1)",
            fontWeight: "600",
            fontSize: "20px",
          }}
        >
          Confirm
        </Box>
      </Box>
    );
  };

  const handleImageChange = (e) => {
    e.preventDefault();

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = () => {
    const croppedDataUrl = cropperRef.current.cropper
      .getCroppedCanvas({
        width: 100,
        height: 100,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      })
      .toDataURL();

    console.log("Cropped Circular Image Data URL:", croppedDataUrl);
  };

  return (
    <Box>
      <GobackButton />
      <Box sx={{ position: "relative", margin: "0 12% 0 12%" }}>
        <Box>
          <img src={uploadPic} />
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              cursor: "pointer",
            }}
            onClick={() => {
              inputRef.current.click();
              setShowCrop(true);
            }}
          >
            <img src={uploadIcon} />
            <Box
              sx={{
                fontSize: "32px",
                fontWeight: "600",
                color: "#fff",
              }}
            >
              Choose a picture
            </Box>
          </Box>
          <input
            ref={inputRef}
            style={{ width: "100%", height: "100%", display: "none" }}
            type="file"
            onChange={handleImageChange}
          />
          {image && showCrop && (
            <Cropper
              ref={cropperRef}
              src={image}
              style={{ height: 400, width: "100%" }}
              guides={false}
              crop={handleCrop}
              viewMode={1}
              dragMode="move"
              autoCropArea={1}
              cropBoxResizable={true}
              minCropBoxWidth={100}
              minCropBoxHeight={100}
              aspectRatio={1}
              toggleDragModeOnDblclick={false}
              checkOrientation={false}
              zoomable={false}
              zoomOnWheel={false}
            />
          )}

          {image && showCrop && <ConfirmButton color={"yellow"} />}
        </Box>
      </Box>
    </Box>
  );
};

export default MyCircularCropper;
