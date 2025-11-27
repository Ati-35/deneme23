// Bottom Sheet Components
// Using @gorhom/bottom-sheet for smooth animations

import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Pressable,
} from 'react-native';
import BottomSheetLib, {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Palette, withAlpha, Shadows } from '../../constants/Colors';
import { BorderRadius, Spacing, ComponentHeight } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Export provider for app root
export { BottomSheetModalProvider, GestureHandlerRootView };

// Bottom Sheet Reference Type
export interface BottomSheetRef {
  open: () => void;
  close: () => void;
  expand: () => void;
  collapse: () => void;
}

// Basic Bottom Sheet
interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  title?: string;
  subtitle?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  style?: ViewStyle;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  (
    {
      children,
      snapPoints = ['50%', '90%'],
      title,
      subtitle,
      showHandle = true,
      showCloseButton = true,
      onClose,
      style,
    },
    ref
  ) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPointsMemo = useMemo(() => snapPoints, [snapPoints]);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.present(),
      close: () => bottomSheetRef.current?.dismiss(),
      expand: () => bottomSheetRef.current?.expand(),
      collapse: () => bottomSheetRef.current?.collapse(),
    }));

    const handleClose = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      bottomSheetRef.current?.dismiss();
      onClose?.();
    }, [onClose]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
          pressBehavior="close"
        />
      ),
      []
    );

    const renderHandle = useCallback(
      () => (
        <View style={styles.handleContainer}>
          {showHandle && <View style={styles.handle} />}
          {(title || showCloseButton) && (
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleContainer}>
                {title && <Text style={styles.sheetTitle}>{title}</Text>}
                {subtitle && <Text style={styles.sheetSubtitle}>{subtitle}</Text>}
              </View>
              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={SemanticColors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ),
      [title, subtitle, showHandle, showCloseButton, handleClose]
    );

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPointsMemo}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        backgroundStyle={styles.sheetBackground}
        style={[styles.sheet, style]}
        enablePanDownToClose
        enableDynamicSizing={false}
      >
        <BottomSheetScrollView style={styles.sheetContent}>
          {children}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

// Action Sheet
interface ActionSheetOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  destructive?: boolean;
  onPress: () => void;
}

interface ActionSheetProps {
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
  onCancel?: () => void;
}

export const ActionSheet = forwardRef<BottomSheetRef, ActionSheetProps>(
  ({ title, message, options, cancelLabel = 'İptal', onCancel }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['auto'], []);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.present(),
      close: () => bottomSheetRef.current?.dismiss(),
      expand: () => bottomSheetRef.current?.expand(),
      collapse: () => bottomSheetRef.current?.collapse(),
    }));

    const handleOptionPress = useCallback((option: ActionSheetOption) => {
      Haptics.impactAsync(
        option.destructive
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Light
      );
      bottomSheetRef.current?.dismiss();
      option.onPress();
    }, []);

    const handleCancel = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      bottomSheetRef.current?.dismiss();
      onCancel?.();
    }, [onCancel]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
          pressBehavior="close"
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleComponent={() => <View style={styles.handle} />}
        backgroundStyle={styles.sheetBackground}
        enableDynamicSizing
        enablePanDownToClose
      >
        <BottomSheetView style={styles.actionSheetContent}>
          {(title || message) && (
            <View style={styles.actionSheetHeader}>
              {title && <Text style={styles.actionSheetTitle}>{title}</Text>}
              {message && <Text style={styles.actionSheetMessage}>{message}</Text>}
            </View>
          )}
          
          <View style={styles.actionSheetOptions}>
            {options.map((option, index) => (
              <Pressable
                key={option.id}
                style={({ pressed }) => [
                  styles.actionSheetOption,
                  pressed && styles.actionSheetOptionPressed,
                  index === 0 && styles.actionSheetOptionFirst,
                ]}
                onPress={() => handleOptionPress(option)}
              >
                {option.icon && (
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={option.destructive ? Palette.error[500] : (option.color || SemanticColors.text.primary)}
                    style={styles.actionSheetOptionIcon}
                  />
                )}
                <Text
                  style={[
                    styles.actionSheetOptionLabel,
                    option.destructive && styles.actionSheetOptionDestructive,
                    option.color && { color: option.color },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.actionSheetCancel}
            onPress={handleCancel}
          >
            <Text style={styles.actionSheetCancelText}>{cancelLabel}</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ActionSheet.displayName = 'ActionSheet';

// Filter Sheet
interface FilterOption {
  id: string;
  label: string;
  selected: boolean;
}

interface FilterSheetProps {
  title?: string;
  options: FilterOption[];
  onSelect: (id: string) => void;
  onApply?: () => void;
  onReset?: () => void;
  multiSelect?: boolean;
}

export const FilterSheet = forwardRef<BottomSheetRef, FilterSheetProps>(
  (
    {
      title = 'Filtrele',
      options,
      onSelect,
      onApply,
      onReset,
      multiSelect = true,
    },
    ref
  ) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['50%', '80%'], []);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.present(),
      close: () => bottomSheetRef.current?.dismiss(),
      expand: () => bottomSheetRef.current?.expand(),
      collapse: () => bottomSheetRef.current?.collapse(),
    }));

    const handleSelect = useCallback((id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(id);
    }, [onSelect]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
          pressBehavior="close"
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleComponent={() => (
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
            <View style={styles.filterHeader}>
              <TouchableOpacity onPress={onReset}>
                <Text style={styles.filterResetText}>Sıfırla</Text>
              </TouchableOpacity>
              <Text style={styles.filterTitle}>{title}</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  bottomSheetRef.current?.dismiss();
                  onApply?.();
                }}
              >
                <Text style={styles.filterApplyText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        backgroundStyle={styles.sheetBackground}
        enablePanDownToClose
      >
        <BottomSheetScrollView style={styles.filterContent}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.filterOption}
              onPress={() => handleSelect(option.id)}
            >
              <Text style={styles.filterOptionLabel}>{option.label}</Text>
              <View
                style={[
                  styles.filterCheckbox,
                  option.selected && styles.filterCheckboxSelected,
                ]}
              >
                {option.selected && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

FilterSheet.displayName = 'FilterSheet';

const styles = StyleSheet.create({
  // Base Sheet
  sheet: {
    ...Shadows.xl,
  },
  sheetBackground: {
    backgroundColor: SemanticColors.background.secondary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  handleContainer: {
    paddingTop: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: withAlpha(SemanticColors.text.secondary, 0.3),
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: Spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.subtle,
  },
  sheetTitleContainer: {
    flex: 1,
  },
  sheetTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
  },
  sheetSubtitle: {
    ...Typography.body.small,
    color: SemanticColors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: withAlpha(SemanticColors.surface.default, 0.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Action Sheet
  actionSheetContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  actionSheetHeader: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.subtle,
    marginBottom: Spacing.sm,
  },
  actionSheetTitle: {
    ...Typography.heading.h5,
    color: SemanticColors.text.primary,
    textAlign: 'center',
  },
  actionSheetMessage: {
    ...Typography.body.small,
    color: SemanticColors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  actionSheetOptions: {
    marginBottom: Spacing.md,
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  actionSheetOptionPressed: {
    backgroundColor: withAlpha(SemanticColors.surface.pressed, 0.3),
  },
  actionSheetOptionFirst: {
    marginTop: Spacing.sm,
  },
  actionSheetOptionIcon: {
    marginRight: Spacing.md,
  },
  actionSheetOptionLabel: {
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
  },
  actionSheetOptionDestructive: {
    color: Palette.error[500],
  },
  actionSheetCancel: {
    backgroundColor: SemanticColors.surface.default,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  actionSheetCancelText: {
    ...Typography.label.medium,
    color: SemanticColors.text.secondary,
  },
  
  // Filter Sheet
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.subtle,
  },
  filterTitle: {
    ...Typography.heading.h5,
    color: SemanticColors.text.primary,
  },
  filterResetText: {
    ...Typography.label.medium,
    color: SemanticColors.text.secondary,
  },
  filterApplyText: {
    ...Typography.label.medium,
    color: Palette.primary[500],
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.subtle,
  },
  filterOptionLabel: {
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
  },
  filterCheckbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    borderColor: SemanticColors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCheckboxSelected: {
    backgroundColor: Palette.primary[500],
    borderColor: Palette.primary[500],
  },
});

export default BottomSheet;




