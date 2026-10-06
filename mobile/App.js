import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Platform,
  BackHandler,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-detect host IP from Expo debugger connection, linkingUri, or fallback to LAN IP
  const getInitialUrl = () => {
    try {
      // 1. Check linkingUri / experienceUrl (e.g. exp://10.88.220.154:8081)
      const linkingUri = Constants.linkingUri || Constants.experienceUrl || '';
      const match = linkingUri.match(/exp:\/\/([^:\/]+)/);
      if (match && match[1] && !match[1].includes('localhost') && !match[1].includes('127.0.0.1') && !match[1].includes('.exp.direct') && !match[1].includes('ngrok')) {
        return `http://${match[1]}:3000?native=true`;
      }

      // 2. Check expoConfig hostUri / debuggerHost
      const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || Constants.manifest?.debuggerHost;
      if (hostUri) {
        const ip = hostUri.split(':')[0];
        if (ip && !ip.includes('localhost') && !ip.includes('127.0.0.1') && !ip.includes('.exp.direct') && !ip.includes('ngrok')) {
          return `http://${ip}:3000?native=true`;
        }
      }
    } catch (e) {
      // Fallback
    }
    return 'http://172.16.14.143:3000?native=true';
  };

  const [currentUrl, setCurrentUrl] = useState(getInitialUrl());
  const [inputUrl, setInputUrl] = useState(currentUrl);

  // Handle hardware back button on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        if (webViewRef.current && canGoBack) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }
  }, [canGoBack]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  const handleSaveUrl = () => {
    let cleanUrl = inputUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `http://${cleanUrl}`;
    }
    if (!cleanUrl.includes('native=true')) {
      cleanUrl += cleanUrl.includes('?') ? '&native=true' : '?native=true';
    }
    setCurrentUrl(cleanUrl);
    setInputUrl(cleanUrl);
    setIsSettingsOpen(false);
    setHasError(false);
    setIsLoading(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F8FAFC" />

      {/* Main Web View */}
      <View style={styles.webContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="always"
          originWhitelist={['*']}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => {
            setIsLoading(false);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setIsLoading(false);
            setHasError(true);
            setErrorMessage(nativeEvent.description || 'Connection failed');
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            if (nativeEvent.statusCode >= 500) {
              setHasError(true);
              setErrorMessage(`Server error: HTTP ${nativeEvent.statusCode}`);
            }
          }}
        />

        {/* Loading Indicator */}
        {isLoading && !hasError && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.loadingText}>Connecting to SmartNeb...</Text>
          </View>
        )}

        {/* Connection Error Screen */}
        {hasError && (
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <Text style={styles.errorIcon}>📡</Text>
              <Text style={styles.errorTitle}>Cannot Connect to Server</Text>
              <Text style={styles.errorDescription}>
                Unable to reach the SmartNeb server at:
              </Text>
              <Text style={styles.errorUrl}>{currentUrl}</Text>
              
              <View style={styles.helpBox}>
                <Text style={styles.helpTitle}>Quick Troubleshooting:</Text>
                <Text style={styles.helpItem}>1. Start the server on your computer: npm run dev</Text>
                <Text style={styles.helpItem}>2. Ensure your phone and PC are on the same Wi-Fi</Text>
                <Text style={styles.helpItem}>3. If your PC IP changed, tap "Change Server URL" below</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                  <Text style={styles.retryButtonText}>Retry Connection</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingsButton} onPress={() => setIsSettingsOpen(true)}>
                  <Text style={styles.settingsButtonText}>Change Server URL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Floating Mini Utility Pill (Bottom Bar) */}
      <View style={styles.floatingBar}>
        <TouchableOpacity style={styles.pillButton} onPress={() => webViewRef.current?.reload()}>
          <Text style={styles.pillButtonText}>🔄 Reload</Text>
        </TouchableOpacity>
        
        <View style={styles.pillDivider} />

        <TouchableOpacity style={styles.pillButton} onPress={() => setIsSettingsOpen(true)}>
          <Text style={styles.pillButtonText}>⚙️ Server IP</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Modal (To change server IP / URL) */}
      <Modal visible={isSettingsOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>SmartNeb Server Settings</Text>
            <Text style={styles.modalSubtitle}>
              Enter your computer's local IP and port (e.g. http://192.168.1.9:3000):
            </Text>

            <TextInput
              style={styles.modalInput}
              value={inputUrl}
              onChangeText={setInputUrl}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://172.16.14.143:3000"
            />

            <View style={styles.quickPresets}>
              <Text style={styles.presetsLabel}>Quick Presets:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setInputUrl('http://172.16.14.143:3000?native=true')}
                >
                  <Text style={styles.presetChipText}>Wi-Fi (172.16.14.143)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setInputUrl('http://192.168.137.1:3000?native=true')}
                >
                  <Text style={styles.presetChipText}>Hotspot (192.168.137.1)</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsSettingsOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveUrl}
              >
                <Text style={styles.modalSaveText}>Save & Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  webContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 20,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  errorIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  errorDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  errorUrl: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D9488',
    backgroundColor: '#CCFBF1',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 16,
  },
  helpBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 18,
  },
  helpTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  helpItem: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 18,
  },
  buttonRow: {
    width: '100%',
    gap: 8,
  },
  retryButton: {
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  settingsButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 13,
  },
  floatingBar: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  pillButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pillDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  quickPresets: {
    marginBottom: 16,
  },
  presetsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  presetChipText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  modalCancelText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
  },
  modalSaveButton: {
    backgroundColor: '#0D9488',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
