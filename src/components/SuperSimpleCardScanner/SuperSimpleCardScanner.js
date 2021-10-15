import React, { useEffect, useState, useRef } from 'react';
import * as BlinkCardSDK from "@microblink/blinkcard-in-browser-sdk";

const SuperSimpleCardScanner = (props) => {
  const cameraFeedback = useRef();
  const cameraFeed = useRef();
  const progressEl = useRef(); 
  const scanFeedback = useRef();
  const initialMessageEl = useRef();
  const [drawContext, setDrawContext] = useState();
  const [wasmSDK, setWasmSDK] = useState();

  //const BlinkCardSDK = window.BlinkCardSDK;

  // Check if browser is supported
  const main = async () => {
    if ( BlinkCardSDK.isBrowserSupported() )
    {
        const loadSettings = new BlinkCardSDK.WasmSDKLoadSettings( "sRwAAAYMZG9taW5pcXVlLmNj7qRade+kkRL8zSzufySD1ho07HpxnChRZvOf7IM2L1zlCCl9JXd0MdZv8PrTOQiRUUOgN0W9ZCXLcpK+a8XHxtB4CJd7Fg0aori5wj7jMiJ88p9fsiJuTzOZUDKGUKiDv17eRREIcqyeg8IqWz6qjHmCfcwBV9518nh93CR+OWzovw1+CRiiV8Y=" );

        BlinkCardSDK.loadWasmModule( loadSettings ).then
        (
            async( wasm ) =>
            {
                // The SDK was initialized successfully, save the wasmSDK for future use
              setWasmSDK(wasm);

              const callbacks = {
                  onFirstSideResult: () => alert( "Flip the card" ),
              };
              
              const recognizer = await BlinkCardSDK.createBlinkCardRecognizer( wasmSDK );
              const recognizerRunner = await BlinkCardSDK.createRecognizerRunner(
                  wasmSDK,
                  [ recognizer ],
                  true,
                  callbacks
              );

              try
              {
                  const videoRecognizer = await BlinkCardSDK.VideoRecognizer.createVideoRecognizerFromCameraStream(
                      cameraFeed,
                      recognizerRunner
                  );

                  // There is more than one way to handle recognition

                  // Using the recognize() method will provide you with the default behavior,
                  // such as built-in error handling, timeout and video feed pausing.
                  const processResult = await videoRecognizer.recognize();


                  // To obtain recognition results see next step
                  if ( processResult !== BlinkCardSDK.RecognizerResultState.Empty )
                  {
                      const recognitionResult = await recognizer.getResult();
                      console.log( recognitionResult );
                  }
                  else
                  {
                      console.log( "Recognition was not successful!" );
                  }

                  videoRecognizer.releaseVideoFeed();
                  recognizerRunner.delete();
                  recognizer.delete();
              }
              catch ( error )
              {
                  if ( error.name === "VideoRecognizerError" )
                  {
                      // Reason is of type BlinkCardSDK.NotSupportedReason and contains information why video
                      // recognizer could not be used. Usually this happens when user didn't grant access to a
                      // camera or when a hardware or OS error occurs.
                      const reason = ( error ).reason;
                  }
              }

            },
            ( error ) =>
            {
                // Error happened during the initialization of the SDK
                console.log( "Error during the initialization of the SDK!", error );
            }
        )
    }
    else
    {
        console.log( "This browser is not supported by the SDK!" );
    }
  }


  /**
   * Initialize and load WASM SDK.
   */
  
  // const main = () =>
  // {
  //     // Check if browser has proper support for WebAssembly
  //     if ( !BlinkCardSDK.isBrowserSupported() )
  //     {
  //         initialMessageEl.innerText = "This browser is not supported!";
  //         return;
  //     }

  //     // 1. It's possible to obtain a free trial license key on microblink.com
  //     const licenseKey = "sRwAAAYMZG9taW5pcXVlLmNj7qRade+kkRL8zSzufySD1ho07HpxnChRZvOf7IM2L1zlCCl9JXd0MdZv8PrTOQiRUUOgN0W9ZCXLcpK+a8XHxtB4CJd7Fg0aori5wj7jMiJ88p9fsiJuTzOZUDKGUKiDv17eRREIcqyeg8IqWz6qjHmCfcwBV9518nh93CR+OWzovw1+CRiiV8Y=";

  //     // 2. Create instance of SDK load settings with your license key
  //     let loadSettings = new BlinkCardSDK.WasmSDKLoadSettings( licenseKey );

  //     // [OPTIONAL] Change default settings

  //     // Show or hide hello message in browser console when WASM is successfully loaded
  //     loadSettings.allowHelloMessage = true;

  //     // In order to provide better UX, display progress bar while loading the SDK
  //     //loadSettings.loadProgressCallback = ( progress ) => ( progressEl.value = progress );

  //     // Set absolute location of the engine, i.e. WASM and support JS files
  //     //loadSettings.engineLocation = "https://unpkg.com/@microblink/blinkcard-in-browser-sdk@2.4.1/resources/";
  //     loadSettings.engineLocation = "";

  //     // 3. Load SDK
  //     BlinkCardSDK.loadWasmModule( loadSettings ).then
  //     (
  //         sdk =>
  //         {
  //             // document.getElementById( "screen-initial" )?.classList.add( "hidden" );
  //             // document.getElementById( "screen-start" )?.classList.remove( "hidden" );
  //             // document.getElementById( "start-scan" )?.addEventListener( "click", ( ev ) =>
  //             // {
  //                 //ev.preventDefault();
  //                 startScan( sdk );
  //             // });
  //         },
  //         error =>
  //         {
  //             initialMessageEl.innerText = "Failed to load SDK!";
  //             console.error( "Failed to load SDK!", error );
  //         }
  //     );
  // }


    /**
     * Scan payment card.
     */
     async function startScan( sdk )
     {
        //  document.getElementById( "screen-start" )?.classList.add( "hidden" );
        //  document.getElementById( "screen-scanning" )?.classList.remove( "hidden" );
 
         // 1. Create a recognizer objects which will be used to recognize single image or stream of images.
         //
         // In this example, we create a BlinkCardRecognizer, which knows how to scan Payment cards
         // and extract payment information from them.
         const blinkCardRecognizer = await BlinkCardSDK.createBlinkCardRecognizer( sdk );
 
         // [OPTIONAL] Create a callbacks object that will receive recognition events, such as detected object location etc.
         const callbacks = {
             onQuadDetection: quad => drawQuad( quad ),
             onFirstSideResult: () => alert( "Flip the document" )
         }
 
         // 2. Create a RecognizerRunner object which orchestrates the recognition with one or more
         //    recognizer objects.
         const recognizerRunner = await BlinkCardSDK.createRecognizerRunner
         (
             // SDK instance to use
             sdk,
             // List of recognizer objects that will be associated with created RecognizerRunner object
             [ blinkCardRecognizer ],
             // [OPTIONAL] Should recognition pipeline stop as soon as first recognizer in chain finished recognition
             false,
             // [OPTIONAL] Callbacks object that will receive recognition events
             callbacks
         );
 
         // 3. Create a VideoRecognizer object and attach it to HTMLVideoElement that will be used for displaying the camera feed
         const videoRecognizer = await BlinkCardSDK.VideoRecognizer.createVideoRecognizerFromCameraStream
         (
             cameraFeed,
             recognizerRunner
         );
 
         // 4. Start the recognition and await for the results
         const processResult = await videoRecognizer.recognize();
 
         // 5. If recognition was successful, obtain the result and display it
         if ( processResult !== BlinkCardSDK.RecognizerResultState.Empty )
         {
             const blinkCardResult = await blinkCardRecognizer.getResult();
             if ( blinkCardResult.state !== BlinkCardSDK.RecognizerResultState.Empty )
             {
                 console.log( "BlinkCard results", blinkCardResult );
 
                 const firstAndLastName = blinkCardResult.owner;
                 const cardNumber = blinkCardResult.cardNumber;
                 const dateOfExpiry = {
                     year: blinkCardResult.expiryDate.year,
                     month: blinkCardResult.expiryDate.month
                 }
 
                 alert
                 (
                     `Hello, ${ firstAndLastName }!\n Your payment card with card number ${ cardNumber } will expire on ${ dateOfExpiry.year }/${ dateOfExpiry.month }.`
                 );
             }
         }
         else
         {
             alert( "Could not extract information!" );
         }
 
         // 7. Release all resources allocated on the WebAssembly heap and associated with camera stream
 
         // Release browser resources associated with the camera stream
         videoRecognizer?.releaseVideoFeed();
 
         // Release memory on WebAssembly heap used by the RecognizerRunner
         recognizerRunner?.delete();
 
         // Release memory on WebAssembly heap used by the recognizer
         blinkCardRecognizer?.delete();
 
         // Clear any leftovers drawn to canvas
         clearDrawCanvas();
 
         // Hide scanning screen and show scan button again
        //  document.getElementById( "screen-start" )?.classList.remove( "hidden" );
        //  document.getElementById( "screen-scanning" )?.classList.add( "hidden" );
     }
 
     /**
      * Utility functions for drawing detected quadrilateral onto canvas.
      */
     function drawQuad( quad )
     {
         clearDrawCanvas();
 
         // Based on detection status, show appropriate color and message
         setupColor( quad );
 
         applyTransform( quad.transformMatrix );
         drawContext.beginPath();
         drawContext.moveTo( quad.topLeft    .x, quad.topLeft    .y );
         drawContext.lineTo( quad.topRight   .x, quad.topRight   .y );
         drawContext.lineTo( quad.bottomRight.x, quad.bottomRight.y );
         drawContext.lineTo( quad.bottomLeft .x, quad.bottomLeft .y );
         drawContext.closePath();
         drawContext.stroke();
     }
 
     /**
      * This function will make sure that coordinate system associated with detectionResult
      * canvas will match the coordinate system of the image being recognized.
      */
     function applyTransform( transformMatrix )
     {
         const canvasAR = cameraFeedback.width / cameraFeedback.height;
         const videoAR = cameraFeed.videoWidth / cameraFeed.videoHeight;
 
         let xOffset = 0;
         let yOffset = 0;
         let scaledVideoHeight = 0
         let scaledVideoWidth = 0
 
         if ( canvasAR > videoAR )
         {
             // pillarboxing: https://en.wikipedia.org/wiki/Pillarbox
             scaledVideoHeight = cameraFeedback.height;
             scaledVideoWidth = videoAR * scaledVideoHeight;
             xOffset = ( cameraFeedback.width - scaledVideoWidth ) / 2.0;
         }
         else
         {
             // letterboxing: https://en.wikipedia.org/wiki/Letterboxing_(filming)
             scaledVideoWidth = cameraFeedback.width;
             scaledVideoHeight = scaledVideoWidth / videoAR;
             yOffset = ( cameraFeedback.height - scaledVideoHeight ) / 2.0;
         }
 
         // first transform canvas for offset of video preview within the HTML video element (i.e. correct letterboxing or pillarboxing)
         drawContext.translate( xOffset, yOffset );
         // second, scale the canvas to fit the scaled video
         drawContext.scale
         (
             scaledVideoWidth / cameraFeed.videoWidth,
             scaledVideoHeight / cameraFeed.videoHeight
         );
 
         // finally, apply transformation from image coordinate system to
         // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
         drawContext.transform
         (
             transformMatrix[0],
             transformMatrix[3],
             transformMatrix[1],
             transformMatrix[4],
             transformMatrix[2],
             transformMatrix[5]
         );
     }
 
     function clearDrawCanvas()
     {
         cameraFeedback.width = cameraFeedback.clientWidth;
         cameraFeedback.height = cameraFeedback.clientHeight;
 
         drawContext.clearRect
         (
             0,
             0,
             cameraFeedback.width,
             cameraFeedback.height
         );
     }
 
     function setupColor( displayable )
     {
         let color = "#FFFF00FF";
 
         if ( displayable.detectionStatus === 0 )
         {
             color = "#FF0000FF";
         }
         else if ( displayable.detectionStatus === 1 )
         {
             color = "#00FF00FF";
         }
 
         drawContext.fillStyle = color;
         drawContext.strokeStyle = color;
         drawContext.lineWidth = 5;
     }
 

     useEffect(() => {
      // General UI helpers
      // const initialMessageEl = document.getElementById( "msg" );
      // const progressEl = document.getElementById( "load-progress" );

      // // UI elements for scanning feedback
      // const cameraFeed = document.getElementById( "camera-feed" );
      //setCameraFeedback(document.getElementById( "camera-feedback" ));
      //setCameraFeedback(React.findDOMNode(this.refs.cameraFeedback).value);
      // const drawContext = cameraFeedback.getContext( "2d" );
      // const scanFeedback = document.getElementById( "camera-guides" );

      setDrawContext(cameraFeedback.current.getContext("2d"));

      main();
     }, [cameraFeedback, progressEl, initialMessageEl, cameraFeed, scanFeedback]);

        return(
          <div>
           <div id="screen-initial">
            <h1 id="msg" ref={initialMessageEl}>Loading...</h1>
            <progress id="load-progress" value="0" max="100" ref={progressEl}></progress>
          </div>
          
          <div id="screen-start" class="hidden">
            <a href="#" id="start-scan">Start scan</a>
          </div>
          
          <div id="screen-scanning" class="hidden">
            <video id="camera-feed" playsinline ref={cameraFeed}></video>
            <canvas id="camera-feedback" ref ={cameraFeedback}></canvas>
            <p id="camera-guides" ref={scanFeedback}>
              Point the camera towards Payment cards
            </p>
          </div>


          <button onClick={() => props.onScan({
            cardName: 'test',
            cvcCode: '343',
            expiryDateMonth: '03',
            expiryDateYear: '2022',
            cardNumber: '4242424242424242',
          })}>Scan</button>
          </div>
        )
}

export default SuperSimpleCardScanner;