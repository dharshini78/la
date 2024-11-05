import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, PerspectiveCamera } from '@react-three/drei'
// import * as THREE from 'three'

const Model = ({ isTalking, isThinking, isListening, visemeData }) => {
  const group = useRef()
  const gltf = useGLTF('https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/Sia_Optimized5.glb')
  // console.log(gltf)

  const { actions } = useAnimations(gltf.animations, group)
  const previousAction = useRef(null);

  // Animations
  useEffect(() => {
    if (!actions) return; // Check if actions are loaded

    actions['EyeBlink'].play();

    // Initialize actions on the first render
    if (!previousAction.current) {
      previousAction.current = actions['Idle'];
      actions['Idle'].play();
      return;
    }

    // Access the current value using .current
    let newAction;

    // Create arrays for idle and talking animations
    const idleAnimations = ['Idle'];
    const talkingAnimations = ['Talking'];

    if (isListening) {
      newAction = actions['Listening'];
      console.warn("Listening")
    } 
    else if (isThinking && !isTalking) {
      newAction = actions['Listening'];
      console.warn("Thinking")
    } 
    else if (isTalking && !isThinking) {
      // Select a random talking animation
      const randomTalkingAnimation = talkingAnimations[Math.floor(Math.random() * talkingAnimations.length)];
      newAction = actions[randomTalkingAnimation];
      console.warn("Talking")
    } else {
      // Select a random idle animation
      const randomIdleAnimation = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
      newAction = actions[randomIdleAnimation];
      console.warn("Idle")
    }

    // Crossfade to the new animations
    crossFade(previousAction.current, newAction, 0.5);

    // Update the previous actions
    previousAction.current = newAction;
  }, [actions, isThinking, isTalking, isListening]);

  const crossFade = (fromAction, toAction, duration) => {
    // Ensure both actions exist
    if (fromAction && toAction) {
      // Crossfade from the current action to the new action
      fromAction.crossFadeTo(toAction, duration, true);
      toAction.play();

      setTimeout(() => {
        fromAction.stop();
      }, duration * 1000);
    }
  };


  // Lip-sync
  const mesh = gltf.scene.children[0].children[1]
  const [speechMarks, setSpeechMarks] = useState([]);

  useEffect(() => {
    setSpeechMarks(visemeData)
    // console.warn("setting visemes done")
  }, [visemeData])

  const phonemeMapping = {
    'a': 'phoneme_aa',
    'e': 'phoneme_er',
    'o': 'phoneme_ao',
    'u': 'phoneme_w_uw',
    'aa': 'phoneme_aa',
    '{': 'phoneme_ae_ax_ah',
    'A:': 'phoneme_ao',
    'aU': 'phoneme_aw',
    'aI': 'phoneme_ay',
    'd': 'phoneme_d_t_n',
    '3:': 'phoneme_er',
    'eI': 'phoneme_ey_eh_uh',
    'f': 'phoneme_f_v',
    'h': 'phoneme_h',
    'k': 'phoneme_k_g_ng',
    'l': 'phoneme_l',
    '@U': 'phoneme_ow',
    'OI': 'phoneme_oy',
    'p': 'phoneme_p_b_m',
    'r\\': 'phoneme_r',
    's': 'phoneme_s_z',
    'S': 'phoneme_sh_ch_jh_zh',
    'T': 'phoneme_th_dh',
    'w': 'phoneme_w_uw',
    'i': 'phoneme_y_iy_ih_ix',
    'b': 'phoneme_p_b_m',
    'dZ': 'phoneme_sh_ch_jh_zh',
    'D': 'phoneme_th_dh',
    'g': 'phoneme_k_g_ng',
    'j': 'phoneme_y_iy_ih_ix',
    'l=': 'phoneme_l',
    'm': 'phoneme_p_b_m',
    'm=': 'phoneme_p_b_m',
    'n': 'phoneme_d_t_n',
    'n=': 'phoneme_d_t_n',
    'N': 'phoneme_k_g_ng',
    'r': 'phoneme_r',
    't': 'phoneme_d_t_n',
    'tS': 'phoneme_sh_ch_jh_zh',
    'v': 'phoneme_f_v',
    'z': 'phoneme_s_z',
    'Z': 'phoneme_sh_ch_jh_zh',
    '@': 'phoneme_ey_eh_uh',
    'E': 'phoneme_ey_eh_uh',
    'I': 'phoneme_y_iy_ih_ix',
    'I@': 'phoneme_y_iy_ih_ix',
    'Q': 'phoneme_w_uw',
    'U': 'phoneme_w_uw',
    'O': 'phoneme_oy',
    'U@': 'phoneme_w_uw',
    'V': 'phoneme_f_v',
    '"': 'phoneme_p_b_m',
    '%': 'phoneme_aa',
    '.': 'phoneme_ao',
    'sil': 'phoneme_sil'
  };

  const morphTargetIndices = {
    "BothEyeBlink": 0,
    "phoneme_sil": 1,
    "phoneme_aa": 2,
    "phoneme_ae_ax_ah": 3,
    "phoneme_ao": 4,
    "phoneme_aw": 5,
    "phoneme_ay": 6,
    "phoneme_d_t_n": 7,
    "phoneme_er": 8,
    "phoneme_ey_eh_uh": 9,
    "phoneme_f_v": 10,
    "phoneme_h": 11,
    "phoneme_k_g_ng": 12,
    "phoneme_l": 13,
    "phoneme_ow": 14,
    "phoneme_oy": 15,
    "phoneme_p_b_m": 16,
    "phoneme_r": 17,
    "phoneme_s_z": 18,
    "phoneme_sh_ch_jh_zh": 19,
    "phoneme_th_dh": 20,
    "phoneme_w_uw": 21,
    "phoneme_y_iy_ih_ix": 22
  };

  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState(null);

  const [lastMark, setLastMark] = useState(null);

  function cubicEase(t) {
    return t * t * (3 - 2 * t);
  }

  function smoothStep(current, target, smoothingFactor) {
    return current + (target - current) * cubicEase(smoothingFactor / 1.3);
  }

  let prevTarget = null;
  let prevInfluence = 0;
  let index = null;

  function blendBetweenMorphTargets(mesh, currentViseme, fadeInDuration, fadeOutDuration) {
    const target = phonemeMapping[currentViseme];
    if (target !== undefined) {
      const index = morphTargetIndices[target];

      // Gradually increase the influence of the current target
      mesh.morphTargetInfluences[index] = smoothStep(
        mesh.morphTargetInfluences[index],
        1,
        0.7
      );

      // Gradually reduce the influence of all other targets
      for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
        if (i !== index) {
          mesh.morphTargetInfluences[i] = smoothStep(
            mesh.morphTargetInfluences[i],
            0,
            0.7
          );
        }
      }

      // Use a Promise to ensure that the influence reduction occurs immediately after the specified durations
      const waitForAnimation = () => {
        return new Promise(resolve => {
          setTimeout(resolve, fadeInDuration + fadeOutDuration);
        });
      };

      waitForAnimation().then(() => {
        // Gradually reduce the influence of the current target after fadeInDuration
        mesh.morphTargetInfluences[index] = smoothStep(
          mesh.morphTargetInfluences[index],
          0,
          0.7
        );
      });
    }
  }

  function binarySearch(array, targetTime) {
    let low = 0;
    let high = array.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midTime = array[mid].time;

      if (midTime <= targetTime) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // The correct viseme is either at index 'low' or 'high'
    const lastIndex = Math.max(0, high);

    return array[lastIndex];
  }

  // Eye Blink
  const blinkInterval = 2500; // 3 seconds
  const blinkDuration = 0.11; // Blink duration (in seconds)
  const [blinkTime, setBlinkTime] = useState(0);

  // Morph target index for eye blink
  const blinkIndex = 0; // Assuming BothEyeBlink is at index 0

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();

    // Eye blinking logic
    if (elapsedTime - blinkTime > blinkInterval / 1000) {
      setBlinkTime(elapsedTime);
      mesh.morphTargetInfluences[blinkIndex] = 1;
      setTimeout(() => {
        mesh.morphTargetInfluences[blinkIndex] = 0;
      }, blinkDuration * 1000);
    }
    
    if (isRunning) {
      const elapsedTime = Math.round(performance.now() - startTime);
      const currentMark = binarySearch(speechMarks, elapsedTime);

      if (currentMark && currentMark.type === 'viseme' && currentMark !== lastMark) {
        const target = phonemeMapping[currentMark.value];

        // console.log(currentMark.value, target);

        if (target !== undefined) {
          // Smoothly transition to the current viseme
          blendBetweenMorphTargets(mesh, currentMark.value, 2000, 2000);

          // If there was a previous target, smoothly reduce its influence
          if (prevTarget !== null) {
            mesh.morphTargetInfluences[prevTarget] = smoothStep(
              prevInfluence,
              0,
              0.5
            );
          }

          // Gradually increase the influence of the current target
          mesh.morphTargetInfluences[index] = smoothStep(
            mesh.morphTargetInfluences[index],
            1,
            0.85
          );

          // Update the previous target and its influence
          prevTarget = index;
          prevInfluence = mesh.morphTargetInfluences[index];
        }

        setLastMark(currentMark);
      }

      // Gradually reduce the influence of morph targets that are not the current or previous target
      for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
        if (
          mesh.morphTargetInfluences[i] !== 0 &&
          i !== prevTarget &&
          i !== index
        ) {
          mesh.morphTargetInfluences[i] = smoothStep(
            mesh.morphTargetInfluences[i],
            0,
            0.125
          );
        }
      }
    }
  });


  const startTalkAnimation = () => {
    setIsRunning(true);
    setStartTime(performance.now());
  }

  const stopTalkAnimation = () => setIsRunning(false)

  useEffect(() => {
    if (isTalking) {
      startTalkAnimation()
    } else {
      stopTalkAnimation()
    }
  }, [isTalking]);

  return <primitive ref={group} scale={window.innerWidth > 768 ? 10.55 : 10.25} position={[0, window.innerWidth > 768 ? -15.75 : -15.5, 0]} object={gltf.scene} rotation={[0.1, 0, 0]}/>
}

function BotHandler({ isTalking, isThinking, isListening, visemeData }) {
  return (
    <div className="bot-handler-cont">
      {/* <img src="https://xrv-xrc.s3.ap-south-1.amazonaws.com/NineReflex/Resources/bot.png" alt="bot"></img> */}
      <Canvas>
        <ambientLight intensity={0.8} />
        <pointLight position={[0, -20, 30]} intensity={3} />
        <pointLight position={[-10, -20, 20]} intensity={2} />
        <pointLight position={[0, -10, 0]} intensity={0.5} />
        <pointLight position={[0, -10, 40]} intensity={0.5} />
        <pointLight position={[0, -10, -40]} intensity={0.5} />
        {/* <pointLight position={[0, 10, 40]} intensity={0.75} /> */}
        <pointLight position={[0, 10, -40]} intensity={0.75} />
        <directionalLight position={[0, -9.75, 30]} intensity={1.5} castShadow />
        <directionalLight position={[0, -9.75, 20]} intensity={1} />
        <directionalLight position={[0, -17.75, 10]} intensity={1} />
        {/* <directionalLight position={[0, 9.75, 30]} intensity={1} /> */}
        {/* <directionalLight position={[0, 9.75, 20]} intensity={1} /> */}

        <directionalLight position={[0, -5, 10]} intensity={3} />


        <directionalLight position={[0, -15, 50]} intensity={2} />
        <directionalLight position={[0, -25, 20]} intensity={1} />

        <PerspectiveCamera makeDefault position={[0, 1.5, window.innerWidth > 768 ? 35 : 40]} fov={7} />

        <Model isTalking={isTalking} isThinking={isThinking} isListening={isListening} visemeData={visemeData} />
      </Canvas>
    </div>
  );
}

export default BotHandler;
