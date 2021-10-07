import Cropper from 'cropperjs';
import { useRef, useEffect, useState } from 'react';

const QUALITY = 1;

export const useCropImg = () => {
  const cropperRef = useRef();
  const [isCropping, setIsCropping] = useState(false);
  const [size, setSize] = useState({ width: undefined, height: undefined });

  useEffect(() => {
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
    };
  }, []);

  const handleResize = ({ detail: { height, width } }) => {
    const roundedDataWidth = Math.round(width);
    const roundedDataHeight = Math.round(height);

    setSize({ width: roundedDataWidth, height: roundedDataHeight });
  };

  const crop = image => {
    if (!cropperRef.current) {
      cropperRef.current = new Cropper(image, {
        modal: true,
        initialAspectRatio: 16 / 9,
        movable: true,
        zoomable: false,
        cropBoxResizable: true,
        background: false,
        crop: handleResize,
      });

      setIsCropping(true);
    }
  };

  const stopCropping = () => {
    if (cropperRef.current) {
      cropperRef.current.destroy();
      cropperRef.current = undefined;
      setIsCropping(false);
    }
  };

  const produceFile = (name, mimeType, lastModifiedDate) => {
    if (!cropperRef.current) {
      return Promise.reject(
        new Error(
          'The cropped has not been instanciated. Make sure to crop the image before producing the corresponding file'
        )
      );
    }

    const canvas = cropperRef.current.getCroppedCanvas();

    return new Promise(resolve =>
      canvas.toBlob(
        async blob => {
          resolve(
            new File([blob], name, {
              type: mimeType,
              lastModifiedDate,
            })
          );
        },
        mimeType,
        QUALITY
      )
    );
  };

  return { crop, produceFile, stopCropping, isCropping, ...size };
};
