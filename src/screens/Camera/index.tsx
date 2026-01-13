/**
 * Camera Screen
 * Native camera capture with multiple modes (photo, video, audio, text)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Keyboard,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera as VisionCamera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import { createSound } from 'react-native-nitro-sound';

type SoundInstance = Awaited<ReturnType<typeof createSound>>;
import RNFS from 'react-native-fs';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { Image as ImageIcon, SwitchCamera, Send, X } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { MAX_FILE_SIZE_BYTES } from '@/constants';
import { IconButton, Background, Header } from '@/components/ui';
import { useAuth, useToast } from '@/providers';
import {
  hapticClick,
  hapticError,
  getLocationContext,
  getWeather,
  formatDuration,
  uploadQueue,
  getPreferences,
  createLogger,
} from '@/lib';
import { MAX_NOTE_LENGTH, MAX_AUDIO_DURATION } from '@/constants';

const log = createLogger('Camera');
import type { RootStackParamList, CaptureMode, MemoryLocation, MemoryWeather } from '@/types';

import {
  PermissionRequest,
  ModeSwitcher,
  CaptureButton,
  NoteInput,
  AudioRecorder,
  PhotoPreview,
} from './components';

type CameraRouteProp = RouteProp<RootStackParamList, 'Camera'>;

export function CameraScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<CameraRouteProp>();
  const { journeyId, mode: initialMode = 'photo' } = route.params;
  const { user } = useAuth();
  const { showToast } = useToast();

  // Mode & loading state
  const [mode, setMode] = useState<CaptureMode>(initialMode);
  const [loading, setLoading] = useState(false);

  // Camera state
  const { hasPermission: cameraPermission, requestPermission: requestCameraPermission } =
    useCameraPermission();
  const { hasPermission: micPermission, requestPermission: requestMicPermission } =
    useMicrophonePermission();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(facing);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<VisionCamera>(null);

  // Zoom
  const [zoom, setZoom] = useState(0);
  const lastZoom = useRef(0);

  // Note state
  const [note, setNote] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const audioRecorderRef = useRef<SoundInstance | null>(null);
  const recordingPathRef = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Video state
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Context
  const [locationContext, setLocationContext] = useState<MemoryLocation | null>(null);
  const [weatherContext, setWeatherContext] = useState<MemoryWeather | null>(null);
  const [_contextLoading, setContextLoading] = useState(true);

  // Tags for capture
  const [captureTags, setCaptureTags] = useState<string[]>([]);

  // Photo preview state
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Track keyboard visibility
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Request permissions on mount
  useEffect(() => {
    async function requestPermissions() {
      if (!cameraPermission) {
        await requestCameraPermission();
      }
      if (!micPermission) {
        await requestMicPermission();
      }
    }
    requestPermissions();
  }, [cameraPermission, micPermission, requestCameraPermission, requestMicPermission]);

  // Fetch location and weather
  useEffect(() => {
    async function fetchContext() {
      try {
        const prefs = await getPreferences();

        if (!prefs.captureLocation) {
          setContextLoading(false);
          return;
        }

        const location = await getLocationContext();
        log.debug('Location context fetched', { hasLocation: !!location, name: location?.name });
        setLocationContext(location);

        if (location && prefs.captureWeather) {
          const weather = await getWeather(location.latitude, location.longitude);
          setWeatherContext(weather);
        }
      } catch (err) {
        log.warn(' Context fetch error', { error: err });
      } finally {
        setContextLoading(false);
      }
    }
    fetchContext();
  }, []);

  // Create fresh audio recorder on focus and refresh location
  useFocusEffect(
    useCallback(() => {
      audioRecorderRef.current = createSound();
      recordingPathRef.current = '';
      setIsRecording(false);
      setRecordingDuration(0);

      // Refresh location context in background (non-blocking)
      (async () => {
        try {
          const prefs = await getPreferences();
          if (prefs.captureLocation) {
            const location = await getLocationContext();
            if (location) {
              setLocationContext(location);
              if (prefs.captureWeather) {
                const weather = await getWeather(location.latitude, location.longitude);
                setWeatherContext(weather);
              }
            }
          }
        } catch {
          // Ignore - location is optional
        }
      })();

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (videoTimerRef.current) {
          clearInterval(videoTimerRef.current);
          videoTimerRef.current = null;
        }
        if (audioRecorderRef.current) {
          audioRecorderRef.current.stopRecorder().catch(() => {});
          audioRecorderRef.current.removeRecordBackListener();
          audioRecorderRef.current = null;
        }
      };
    }, [])
  );

  // Navigation
  const handleClose = () => {
    hapticClick();
    navigation.goBack();
  };

  // Photo capture
  const handleTakePhoto = async () => {
    if (!cameraRef.current || !user?.id || loading) return;

    hapticClick();
    setLoading(true);

    try {
      const photo = await cameraRef.current.takePhoto();

      if (!photo?.path) {
        throw new Error('Failed to capture photo');
      }

      const photoUri = `file://${photo.path}`;
      setPreviewUri(photoUri);
      setShowPreview(true);
    } catch (err) {
      log.error(' Capture error', { error: err });
      hapticError();
      showToast('Failed to capture photo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreview = async () => {
    if (!previewUri || !user?.id) return;

    // Check file size
    try {
      const stat = await RNFS.stat(previewUri);
      if (stat.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = Math.round(stat.size / (1024 * 1024));
        hapticError();
        showToast(`Photo too large (${sizeMB}MB). Max is 50MB.`, 'error');
        setShowPreview(false);
        setPreviewUri(null);
        return;
      }
    } catch {
      // If we can't check size, proceed anyway
    }

    hapticClick();

    uploadQueue.addPhoto({
      journeyId,
      userId: user.id,
      localUri: previewUri,
      location: locationContext,
      weather: weatherContext,
      tags: captureTags.length > 0 ? captureTags : undefined,
    });

    setPreviewUri(null);
    setShowPreview(false);
    setCaptureTags([]);
  };

  const handleDiscardPreview = () => {
    hapticClick();
    setPreviewUri(null);
    setShowPreview(false);
  };

  // Pick from gallery
  const handlePickImage = async () => {
    if (!user?.id) return;

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.didCancel || !result.assets?.[0]?.uri) return;

    const pickedUri = result.assets[0].uri;

    // Check file size
    try {
      const stat = await RNFS.stat(pickedUri);
      if (stat.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = Math.round(stat.size / (1024 * 1024));
        hapticError();
        showToast(`Photo too large (${sizeMB}MB). Max is 50MB.`, 'error');
        return;
      }
    } catch {
      // If we can't check size, proceed anyway
    }

    uploadQueue.addPhoto({
      journeyId,
      userId: user.id,
      localUri: pickedUri,
      location: locationContext,
      weather: weatherContext,
      tags: captureTags.length > 0 ? captureTags : undefined,
    });
  };

  // Flip camera
  const handleFlipCamera = () => {
    hapticClick();
    setIsCameraReady(false);
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // Pinch to zoom gesture
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      lastZoom.current = zoom;
    })
    .onUpdate((event) => {
      const newZoom = lastZoom.current + (event.scale - 1) * 0.5;
      setZoom(Math.min(Math.max(newZoom, 0), 1));
    });

  // Save note
  const handleSaveNote = async () => {
    const trimmedNote = note.trim();
    if (!trimmedNote || !user?.id) return;

    hapticClick();

    if (trimmedNote.length > MAX_NOTE_LENGTH) {
      showToast(`Note is too long (max ${MAX_NOTE_LENGTH.toLocaleString()} characters)`, 'error');
      return;
    }

    // Refresh location if not yet loaded
    let currentLocation = locationContext;
    let currentWeather = weatherContext;
    if (!currentLocation) {
      try {
        currentLocation = await getLocationContext();
        if (currentLocation) {
          setLocationContext(currentLocation);
          const prefs = await getPreferences();
          if (prefs.captureWeather) {
            currentWeather = await getWeather(currentLocation.latitude, currentLocation.longitude);
            setWeatherContext(currentWeather);
          }
        }
      } catch {
        // Continue without location
      }
    }

    try {
      await uploadQueue.addNote({
        journeyId,
        userId: user.id,
        note: trimmedNote,
        location: currentLocation,
        weather: currentWeather,
        tags: captureTags.length > 0 ? captureTags : undefined,
      });

      setNote('');
    } catch (err) {
      log.error(' Note error', { error: err });
      hapticError();
      showToast('Failed to save note', 'error');
    }
  };

  // Audio recording
  const startRecording = async () => {
    hapticClick();

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Sunroof needs access to your microphone to record audio.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Microphone access is needed to record audio.');
          return;
        }
      }

      if (Platform.OS === 'ios' && !micPermission) {
        const granted = await requestMicPermission();
        if (!granted) {
          Alert.alert('Permission Required', 'Microphone access is needed to record audio.');
          return;
        }
      }

      // Ensure we have a recorder (created by useFocusEffect)
      if (!audioRecorderRef.current) {
        audioRecorderRef.current = createSound();
      }

      const fileName = `${Date.now()}${Platform.OS === 'ios' ? '.m4a' : '.mp4'}`;
      const path = `${RNFS.CachesDirectoryPath}/${fileName}`;

      const uri = await audioRecorderRef.current.startRecorder(path);
      recordingPathRef.current = uri;

      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((d) => {
          if (d >= MAX_AUDIO_DURATION) {
            stopRecording();
            return d;
          }
          return d + 1;
        });
      }, 1000);
    } catch (err) {
      log.error('Audio recording failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      showToast('Failed to start recording', 'error');
    }
  };

  const stopRecording = async () => {
    if (!recordingPathRef.current || !user?.id || !audioRecorderRef.current) return;

    hapticClick();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const uri = await audioRecorderRef.current.stopRecorder();
      audioRecorderRef.current.removeRecordBackListener();
      const duration = recordingDuration;

      recordingPathRef.current = '';
      setIsRecording(false);
      setRecordingDuration(0);

      if (!uri) {
        throw new Error('No recording URI');
      }

      uploadQueue.addAudio({
        journeyId,
        userId: user.id,
        localUri: uri,
        duration,
        location: locationContext,
        weather: weatherContext,
        tags: captureTags.length > 0 ? captureTags : undefined,
      });
    } catch (err) {
      log.error('Audio Stop error', { error: err });
      hapticError();
      showToast('Failed to save recording', 'error');
    }
  };

  // Video recording
  const startVideoRecording = async () => {
    if (!cameraRef.current || !user?.id || !isCameraReady) {
      log.warn('Video Camera not ready');
      showToast('Camera is not ready yet', 'error');
      return;
    }

    if (!micPermission) {
      await requestMicPermission();
    }

    try {
      setIsRecordingVideo(true);
      setVideoDuration(0);
      hapticClick();

      videoTimerRef.current = setInterval(() => {
        setVideoDuration((d) => d + 1);
      }, 1000);

      cameraRef.current.startRecording({
        onRecordingFinished: async (video) => {
          const videoUri = `file://${video.path}`;
          await handleVideoSave(videoUri);
        },
        onRecordingError: (error) => {
          log.error('Video Recording error', { error });
          hapticError();
          showToast('Failed to record video', 'error');
          setIsRecordingVideo(false);
          if (videoTimerRef.current) {
            clearInterval(videoTimerRef.current);
            videoTimerRef.current = null;
          }
        },
      });
    } catch (err) {
      log.error('Video Recording error', { error: err });
      hapticError();
      showToast('Failed to record video', 'error');
      setIsRecordingVideo(false);
    }
  };

  const stopVideoRecording = async () => {
    if (!cameraRef.current) return;

    hapticClick();

    if (videoTimerRef.current) {
      clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
    }

    try {
      await cameraRef.current.stopRecording();
    } catch (err) {
      log.error('Video Stop error', { error: err });
    }
  };

  const handleVideoSave = async (videoUri: string) => {
    if (!user?.id) return;

    const duration = videoDuration;
    setIsRecordingVideo(false);
    setVideoDuration(0);

    // Check file size before uploading
    try {
      const stat = await RNFS.stat(videoUri);
      if (stat.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = Math.round(stat.size / (1024 * 1024));
        hapticError();
        showToast(`Video too large (${sizeMB}MB). Max is 50MB.`, 'error');
        return;
      }
    } catch {
      // If we can't check size, proceed anyway
    }

    uploadQueue.addVideo({
      journeyId,
      userId: user.id,
      localUri: videoUri,
      duration,
      location: locationContext,
      weather: weatherContext,
      tags: captureTags.length > 0 ? captureTags : undefined,
    });
  };

  // Permission check
  if (!cameraPermission && (mode === 'photo' || mode === 'video')) {
    return (
      <PermissionRequest
        insetTop={insets.top}
        onClose={handleClose}
        onRequestPermission={requestCameraPermission}
      />
    );
  }

  // Photo preview
  if (showPreview && previewUri) {
    return (
      <PhotoPreview
        uri={previewUri}
        insets={{ top: insets.top, bottom: insets.bottom }}
        tags={captureTags}
        onTagsChange={setCaptureTags}
        onSave={handleSavePreview}
        onDiscard={handleDiscardPreview}
      />
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Background based on mode */}
      {(mode === 'photo' || mode === 'video') && cameraPermission && device ? (
        <GestureDetector gesture={pinchGesture}>
          <View style={StyleSheet.absoluteFillObject}>
            <VisionCamera
              ref={cameraRef}
              style={StyleSheet.absoluteFillObject}
              device={device}
              isActive={true}
              photo={true}
              video={true}
              audio={micPermission === true}
              zoom={1 + zoom * 9}
              onInitialized={() => setIsCameraReady(true)}
            />
            {zoom > 0 && !isRecordingVideo && (
              <View style={styles.zoomIndicator}>
                <Text style={styles.zoomText}>{(1 + zoom * 9).toFixed(1)}x</Text>
              </View>
            )}
            {isRecordingVideo && (
              <View style={styles.videoRecordingOverlay}>
                <View style={styles.videoRecordingBadge}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.videoRecordingTime}>{formatDuration(videoDuration)}</Text>
                </View>
              </View>
            )}
          </View>
        </GestureDetector>
      ) : (
        <Background />
      )}

      {/* Header */}
      <Header
        paddingTop={insets.top}
        absolute
        leftIcon={<X size={20} color={colors.white} />}
        onLeftPress={handleClose}
        leftAccessibilityLabel="Close camera"
        rightContent={
          mode === 'text' && keyboardVisible ? (
            <TouchableOpacity
              onPress={() => Keyboard.dismiss()}
              style={styles.doneButton}
              activeOpacity={0.7}
              accessibilityLabel="Dismiss keyboard"
              accessibilityRole="button"
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Content based on mode */}
      {mode === 'text' && <NoteInput value={note} onChangeText={setNote} />}

      {mode === 'audio' && <AudioRecorder isRecording={isRecording} duration={recordingDuration} />}

      {/* Bottom controls */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + spacing.lg }]}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.controlsContent}>
          <ModeSwitcher currentMode={mode} onModeChange={setMode} />

          {/* Action buttons */}
          <View style={styles.actionRow}>
            {mode === 'photo' ? (
              <>
                <IconButton
                  icon={<ImageIcon size={20} color={colors.white} />}
                  onPress={handlePickImage}
                  accessibilityLabel="Pick from gallery"
                  variant="bordered"
                  size="lg"
                />

                <CaptureButton loading={loading} onPress={handleTakePhoto} />

                <IconButton
                  icon={<SwitchCamera size={20} color={colors.white} />}
                  onPress={handleFlipCamera}
                  accessibilityLabel="Flip camera"
                  variant="bordered"
                  size="lg"
                />
              </>
            ) : mode === 'video' ? (
              <>
                <View style={styles.controlSpacer} />

                <CaptureButton
                  loading={loading}
                  isVideo
                  isRecording={isRecordingVideo}
                  onPress={isRecordingVideo ? stopVideoRecording : startVideoRecording}
                />

                <IconButton
                  icon={<SwitchCamera size={20} color={colors.white} />}
                  onPress={handleFlipCamera}
                  accessibilityLabel="Flip camera"
                  variant="bordered"
                  size="lg"
                />
              </>
            ) : mode === 'audio' ? (
              <>
                <View style={styles.controlSpacer} />

                <CaptureButton
                  loading={loading}
                  isRecording={isRecording}
                  onPress={isRecording ? stopRecording : startRecording}
                />

                <View style={styles.controlSpacer} />
              </>
            ) : (
              <>
                <View style={styles.controlSpacer} />

                <TouchableOpacity
                  onPress={handleSaveNote}
                  disabled={!note.trim() || loading}
                  style={[
                    styles.saveNoteButton,
                    (!note.trim() || loading) && styles.saveNoteButtonDisabled,
                  ]}
                  accessibilityLabel="Save note"
                  accessibilityRole="button"
                >
                  {loading ? (
                    <ActivityIndicator color={colors.grayDark} />
                  ) : (
                    <>
                      <Text style={styles.saveNoteText}>Save Note</Text>
                      <Send size={16} color={colors.grayDark} />
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.controlSpacer} />
              </>
            )}
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  zoomIndicator: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    backgroundColor: colors.overlay.dark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  zoomText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  videoRecordingOverlay: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
  },
  videoRecordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  videoRecordingTime: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlsContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    minHeight: 80,
  },
  saveNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  saveNoteButtonDisabled: {
    opacity: 0.4,
  },
  saveNoteText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.grayDark,
  },
  controlSpacer: {
    width: 48,
  },
  doneButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  doneButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});
