import { AppState, AppStateStatus, Keyboard, Platform, Pressable, StyleSheet, TextInput, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import * as Clipboard from 'expo-clipboard';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { extractLettersWithValidation } from '@/lib/extract-letters';

export default function HomeScreen() {
  const [password, setPassword] = useState('');
  const [positions, setPositions] = useState('');
  const [revealPassword, setRevealPassword] = useState(false);
  const [result, setResult] = useState<{ letters: string[]; outOfRange: number[]; invalid: string[] } | null>(null);
  const [autoClearTimer, setAutoClearTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const positionsInputRef = useRef<TextInput>(null);

  const computeResult = () => {
    const res = extractLettersWithValidation(password, positions);
    setResult(res);
    if (res.letters.length > 0) {
      if (autoClearTimer) clearTimeout(autoClearTimer);
      const timer = setTimeout(() => {
        setResult(null);
        setPositions('');
      }, 30000);
      setAutoClearTimer(timer);
    }
  };

  useEffect(() => {
    computeResult();
  }, [password, positions]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        setPassword('');
        setPositions('');
        setResult(null);
        setRevealPassword(false);
        if (autoClearTimer) clearTimeout(autoClearTimer);
      }
    });
    return () => subscription.remove();
  }, [autoClearTimer]);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setPassword(text);
      passwordInputRef.current?.focus();
    }
  };

  const handleCopyResult = async () => {
    if (result?.letters.length) {
      const joined = result.letters.join(',');
      await Clipboard.setStringAsync(joined);
    }
  };

  const handleClearAll = () => {
    setPassword('');
    setPositions('');
    setResult(null);
    setRevealPassword(false);
    if (autoClearTimer) clearTimeout(autoClearTimer);
    Keyboard.dismiss();
  };

  const handleRevealToggle = () => {
    setRevealPassword(!revealPassword);
  };

  const hasResult = result && result.letters.length > 0;
  const hasErrors = result && (result.outOfRange.length > 0 || result.invalid.length > 0);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          PassIndex
        </ThemedText>

        {Platform.OS === 'web' && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.webHint}>
            Running on web — primary dev loop
          </ThemedText>
        )}

        <ThemedView type="backgroundElement" style={styles.formContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Password
          </ThemedText>
          <ThemedView style={styles.passwordRow}>
            <TextInput
              ref={passwordInputRef}
              style={styles.passwordInput}
              placeholder="Paste or type password"
              secureTextEntry={!revealPassword}
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={handleRevealToggle} style={({ pressed }) => [styles.buttonPlaceholder, pressed && styles.buttonPressed]}>
              <ThemedText type="smallBold" style={styles.buttonText}>
                {revealPassword ? 'Hide' : 'Reveal'}
              </ThemedText>
            </Pressable>
            <Pressable onPress={handlePaste} style={({ pressed }) => [styles.buttonPlaceholder, pressed && styles.buttonPressed]}>
              <ThemedText type="smallBold" style={styles.buttonText}>Paste</ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Positions (comma-separated, 1-based)
          </ThemedText>
          <TextInput
            ref={positionsInputRef}
            style={styles.positionsInput}
            placeholder="e.g. 3,5,7"
            placeholderTextColor="#888"
            keyboardType="numbers-and-punctuation"
            value={positions}
            onChangeText={setPositions}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Result
          </ThemedText>
          <ThemedView style={styles.resultArea}>
            {hasResult && (
              <>
                <ThemedView style={styles.letterTiles}>
                  {result.letters.map((letter, idx) => (
                    <ThemedView key={idx} style={styles.letterTile} type="backgroundSelected">
                      <ThemedText type="smallBold" style={styles.letterTileText}>
                        {letter}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" style={styles.letterTileLabel}>
                        {positions.split(/[,\s]+/).filter(Boolean)[idx] || idx + 1}
                      </ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
                <ThemedView style={styles.joinedResult}>
                  <ThemedText type="small" themeColor="textSecondary">Joined:</ThemedText>
                  <ThemedText type="code" style={styles.joinedText}>
                    {result.letters.join(',')}
                  </ThemedText>
                </ThemedView>
              </>
            )}
            {hasErrors && (
              <ThemedView style={styles.errorContainer}>
                {result!.outOfRange.length > 0 && (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.errorText}>
                    Out of range: {result!.outOfRange.join(', ')}
                  </ThemedText>
                )}
                {result!.invalid.length > 0 && (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.errorText}>
                    Invalid: {result!.invalid.join(', ')}
                  </ThemedText>
                )}
              </ThemedView>
            )}
            {!hasResult && !hasErrors && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.resultPlaceholder}>
                Enter password and positions above to see result
              </ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.buttonRow}>
            <Pressable onPress={handleCopyResult} disabled={!hasResult} style={({ pressed }) => [styles.buttonPlaceholder, pressed && styles.buttonPressed]}>
              <ThemedText type="smallBold" style={[styles.buttonText, !hasResult && styles.buttonDisabled]}>Copy Result</ThemedText>
            </Pressable>
            <Pressable onPress={handleClearAll} style={({ pressed }) => [styles.buttonPlaceholder, pressed && styles.buttonPressed]}>
              <ThemedText type="smallBold" style={styles.buttonText}>Clear All</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'stretch',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  formContainer: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginTop: Spacing.four,
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    fontSize: 16,
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    color: '#000',
  },
  positionsInput: {
    height: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    color: '#000',
  },
  buttonPlaceholder: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  buttonPressed: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    color: '#000',
  },
  buttonDisabled: {
    color: '#999',
  },
  resultArea: {
    minHeight: 80,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fafafa',
    gap: Spacing.two,
  },
  letterTiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  letterTile: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    alignItems: 'center',
    gap: 2,
  },
  letterTileText: {
    fontSize: 24,
    fontFamily: 'monospace',
  },
  letterTileLabel: {
    fontSize: 10,
  },
  joinedResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  joinedText: {
    fontFamily: 'monospace',
  },
  errorContainer: {
    flexDirection: 'column',
    gap: Spacing.one,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
  },
  resultPlaceholder: {
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  webHint: {
    textAlign: 'center',
    marginTop: Spacing.four,
  },
});