import React from 'react';

const TextToSpeech = ({ shouldPlayResponse, textToSpeak, playAudio, language, revokeMicrophoneAccess, setAudioSrc, setIsPlaying, textToSpeechResponse }) => {

  const synthesizeSpeech = async () => {
    // console.log("synthesizeSpeech")

    try {
      // console.log("textToSpeechResponse", textToSpeechResponse)
      const audioBlob = new Blob([textToSpeechResponse], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      // console.log("sending", audioUrl)
      await revokeMicrophoneAccess()
      setAudioSrc(audioUrl)
      playAudio(audioUrl)
      setIsPlaying(true)
    }
    catch (error) {
      console.error('Error synthesizing speech:', error);
    }
  };

  // Call synthesizeSpeech whenever textToSpeak changes
  React.useEffect(() => {
    if (shouldPlayResponse.current) {
      // console.log("here", textToSpeak)
      synthesizeSpeech(textToSpeak);
      // console.log("Using GoogleCloud...")
      shouldPlayResponse.current = false;
    }
  }, [shouldPlayResponse.current]);

  return null; // Since this is just for triggering speech synthesis, return null
};

export default TextToSpeech;
