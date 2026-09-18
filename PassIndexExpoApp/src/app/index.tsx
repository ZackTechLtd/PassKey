import { Platform, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
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
              style={styles.passwordInput}
              placeholder="Paste or type password"
              secureTextEntry={true}
              placeholderTextColor="#888"
            />
            <ThemedView style={styles.buttonPlaceholder} type="backgroundElement">
              <ThemedText type="smallBold" style={styles.buttonText}>Reveal</ThemedText>
            </ThemedView>
            <ThemedView style={styles.buttonPlaceholder} type="backgroundElement">
              <ThemedText type="smallBold" style={styles.buttonText}>Paste</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Positions (comma-separated, 1-based)
          </ThemedText>
          <TextInput
            style={styles.positionsInput}
            placeholder="e.g. 3,5,7"
            placeholderTextColor="#888"
            keyboardType="numbers-and-punctuation"
          />

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Result
          </ThemedText>
          <ThemedView style={styles.resultArea}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.resultPlaceholder}>
              Enter password and positions above to see result
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.buttonRow}>
            <ThemedView style={styles.buttonPlaceholder} type="backgroundElement">
              <ThemedText type="smallBold" style={styles.buttonText}>Copy Result</ThemedText>
            </ThemedView>
            <ThemedView style={styles.buttonPlaceholder} type="backgroundElement">
              <ThemedText type="smallBold" style={styles.buttonText}>Clear All</ThemedText>
            </ThemedView>
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
  buttonText: {
    color: '#000',
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
