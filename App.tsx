import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { calculate, pressKey, sanitizePercent } from './src/calc';

const PRESETS = [10, 15, 20, 25];
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];
const MAX_PEOPLE = 50;

const light = {
  bg: '#F4F6F8',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  accent: '#0F766E',
  onAccent: '#FFFFFF',
  chip: '#EEF2F6',
  result: '#0F766E',
};
const dark: typeof light = {
  bg: '#0B1220',
  card: '#141C2E',
  text: '#F1F5F9',
  muted: '#94A3B8',
  border: '#1F2A44',
  accent: '#2DD4BF',
  onAccent: '#062925',
  chip: '#1B2540',
  result: '#0F766E',
};

const money = (n: number) =>
  n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function Calculator() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? dark : light;
  const s = useMemo(() => makeStyles(c), [c]);

  const [bill, setBill] = useState('');
  const [preset, setPreset] = useState<number | null>(15);
  const [custom, setCustom] = useState('');
  const [people, setPeople] = useState(1);

  const tipPercent = preset ?? (parseFloat(custom) || 0);
  const result = calculate(parseFloat(bill) || 0, tipPercent, people);

  const reset = () => {
    setBill('');
    setPreset(15);
    setCustom('');
    setPeople(1);
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: insets.bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.title}>Tip Calculator</Text>
          <Pressable
            onPress={reset}
            accessibilityRole="button"
            accessibilityLabel="Reset"
            style={({ pressed }) => [s.resetBtn, pressed && s.pressed]}>
            <Text style={s.resetText}>Reset</Text>
          </Pressable>
        </View>

        <View style={s.card}>
          <Text style={s.label}>Bill Amount</Text>
          <Text
            style={[s.billValue, bill === '' && { color: c.muted }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            accessibilityLabel={`Bill amount ${bill || '0'}`}>
            ${bill === '' ? '0.00' : bill}
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.label}>Tip</Text>
          <View style={s.row}>
            {PRESETS.map(p => {
              const active = preset === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => {
                    setPreset(p);
                    setCustom('');
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[s.chip, active && s.chipActive]}>
                  <Text style={[s.chipText, active && s.chipTextActive]}>
                    {p}%
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={[s.customWrap, preset === null && s.customActive]}>
            <TextInput
              value={custom}
              onChangeText={t => {
                const v = sanitizePercent(t);
                setCustom(v);
                setPreset(v === '' ? 15 : null);
              }}
              placeholder="Custom"
              placeholderTextColor={c.muted}
              keyboardType="decimal-pad"
              maxLength={6}
              style={s.customInput}
              accessibilityLabel="Custom tip percent"
            />
            <Text style={s.percentSign}>%</Text>
          </View>
        </View>

        <View style={[s.card, s.splitCard]}>
          <View>
            <Text style={s.label}>Split between</Text>
            <Text style={s.hint}>{people === 1 ? 'person' : 'persons'}</Text>
          </View>
          <View style={s.stepper}>
            <Pressable
              onPress={() => setPeople(p => Math.max(1, p - 1))}
              disabled={people <= 1}
              accessibilityRole="button"
              accessibilityLabel="Decrease persons"
              style={[s.stepBtn, people <= 1 && s.disabled]}>
              <Text style={s.stepText}>−</Text>
            </Pressable>
            <Text style={s.people}>{people}</Text>
            <Pressable
              onPress={() => setPeople(p => Math.min(MAX_PEOPLE, p + 1))}
              disabled={people >= MAX_PEOPLE}
              accessibilityRole="button"
              accessibilityLabel="Increase persons"
              style={[s.stepBtn, people >= MAX_PEOPLE && s.disabled]}>
              <Text style={s.stepText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={s.resultCard}>
          <View style={s.resultRow}>
            <Text style={s.resultLabel}>Tip</Text>
            <Text style={s.resultSmall}>${money(result.tip)}</Text>
          </View>
          <View style={s.resultRow}>
            <Text style={s.resultLabel}>Total</Text>
            <Text style={s.resultSmall}>${money(result.total)}</Text>
          </View>
          <View style={s.divider} />
          <Text style={s.resultLabel}>Per person</Text>
          <Text style={s.resultBig} numberOfLines={1} adjustsFontSizeToFit>
            ${money(result.perPerson)}
          </Text>
        </View>

        <View style={s.keypad}>
          {KEYS.map(k => (
            <Pressable
              key={k}
              onPress={() => setBill(b => pressKey(b, k))}
              onLongPress={k === 'back' ? () => setBill('') : undefined}
              accessibilityRole="button"
              accessibilityLabel={k === 'back' ? 'Backspace' : k === '.' ? 'Decimal point' : k}
              android_ripple={{ color: c.border, borderless: false }}
              style={({ pressed }) => [s.key, pressed && s.pressed]}>
              <Text style={s.keyText}>{k === 'back' ? '⌫' : k}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type Palette = typeof light;

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 16, gap: 10 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    title: { fontSize: 24, fontWeight: '700', color: c.text },
    resetBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: c.chip,
    },
    resetText: { color: c.accent, fontWeight: '600', fontSize: 15 },
    pressed: { opacity: 0.6 },
    disabled: { opacity: 0.35 },
    card: {
      backgroundColor: c.card,
      borderRadius: 20,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: c.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    hint: { fontSize: 15, color: c.text, marginTop: 2 },
    billValue: {
      fontSize: 36,
      fontWeight: '700',
      color: c.text,
      marginTop: 2,
    },
    row: { flexDirection: 'row', gap: 8, marginTop: 12 },
    chip: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: c.chip,
    },
    chipActive: { backgroundColor: c.accent },
    chipText: { fontSize: 16, fontWeight: '600', color: c.text },
    chipTextActive: { color: c.onAccent },
    customWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: c.chip,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    customActive: { borderColor: c.accent },
    customInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      paddingVertical: 6,
    },
    percentSign: { fontSize: 16, color: c.muted, fontWeight: '600' },
    splitCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    stepBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.chip,
    },
    stepText: { fontSize: 24, color: c.accent, fontWeight: '600', marginTop: -2 },
    people: {
      minWidth: 32,
      textAlign: 'center',
      fontSize: 24,
      fontWeight: '700',
      color: c.text,
    },
    resultCard: {
      backgroundColor: c.result,
      borderRadius: 24,
      padding: 16,
    },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    resultLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '600' },
    resultSmall: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: 'rgba(255,255,255,0.35)',
      marginVertical: 10,
    },
    resultBig: { color: '#FFFFFF', fontSize: 34, fontWeight: '800' },
    keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    key: {
      width: '31.8%',
      flexGrow: 1,
      height: 50,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    keyText: { fontSize: 24, fontWeight: '500', color: c.text },
  });

export default function App() {
  return (
    <SafeAreaProvider>
      <Calculator />
    </SafeAreaProvider>
  );
}
