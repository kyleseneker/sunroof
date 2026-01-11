/**
 * Collaborator Section
 * Email input and collaborator chips
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { Input } from '@/components/ui';
import { hapticClick } from '@/lib';

interface Collaborator {
  email: string;
  userId: string | null;
  isPending: boolean;
}

interface CollaboratorSectionProps {
  email: string;
  onEmailChange: (email: string) => void;
  collaborators: Collaborator[];
  onRemoveCollaborator: (email: string) => void;
}

export function CollaboratorSection({
  email,
  onEmailChange,
  collaborators,
  onRemoveCollaborator,
}: CollaboratorSectionProps) {
  const handleClear = () => {
    hapticClick();
    onEmailChange('');
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Invite collaborators (optional)</Text>
      <View style={styles.collaboratorInputWrapper}>
        <Input
          placeholder="friend@email.com"
          value={email}
          onChangeText={onEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.collaboratorInput}
        />
        {email.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.collaboratorClearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.collaboratorHint}>They&apos;ll receive an invite when you save</Text>
      {collaborators.length > 0 && (
        <View style={styles.collaboratorsList}>
          {collaborators.map((collab) => (
            <View
              key={collab.email}
              style={[styles.collaboratorChip, collab.isPending && styles.collaboratorChipPending]}
            >
              <Text style={styles.collaboratorEmail} numberOfLines={1}>
                {collab.email}
              </Text>
              {collab.isPending && <Text style={styles.pendingLabel}>invited</Text>}
              <TouchableOpacity
                onPress={() => onRemoveCollaborator(collab.email)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={14} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    // No bottom margin - submit button provides spacing
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  collaboratorInputWrapper: {
    position: 'relative',
  },
  collaboratorInput: {
    marginBottom: 0,
  },
  collaboratorHint: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing.xs,
  },
  collaboratorClearButton: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: spacing.xs,
  },
  collaboratorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  collaboratorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.overlay.light,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  collaboratorEmail: {
    color: colors.white,
    fontSize: fontSize.sm,
    flexShrink: 1,
  },
  collaboratorChipPending: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  pendingLabel: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
