import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Linking, 
  StyleSheet 
} from 'reactnative';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function NodeDetailSheet({ 
  node, 
  completed, 
  onClose, 
  onToggleCompleted, 
  onGenerateSubRoadmap 
}) {
  if (!node) return null;

  const displayResources = node.resources || [];

  const handleOpenLink = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  return (
    <Modal
      visible={!!node}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{node.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>{node.description}</Text>

            {/* Meta Row */}
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text style={styles.metaText}>{node.estimatedTime || 'N/A'}</Text>
              </View>

              <View style={styles.metaBadge}>
                <Ionicons 
                  name={completed ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={completed ? colors.success : colors.inkMuted} 
                />
                <Text style={[styles.metaText, { color: completed ? colors.success : colors.inkMuted }]}>
                  {completed ? 'Completed' : 'Not Started'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsGroup}>
              <TouchableOpacity 
                style={[
                  styles.actionBtn, 
                  { backgroundColor: completed ? colors.noteRose : colors.noteGreen }
                ]}
                onPress={() => onToggleCompleted(node.id)}
              >
                <Ionicons 
                  name={completed ? "close-circle-outline" : "checkmark-circle-outline"} 
                  size={18} 
                  color={colors.ink} 
                />
                <Text style={styles.actionBtnText}>
                  {completed ? 'Mark Incomplete' : 'Mark Completed'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => onGenerateSubRoadmap(node)}
              >
                <Ionicons name="sparkles-outline" size={18} color="#fff" />
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>Sub-Roadmap</Text>
              </TouchableOpacity>
            </View>

            {/* Embedded Study Resources */}
            <View style={styles.resourcesSection}>
              <Text style={styles.sectionTitle}>📚 Study Guides & Links</Text>

              {displayResources.length === 0 ? (
                <Text style={styles.emptyText}>No resource cards available for this topic.</Text>
              ) : (
                displayResources.map((res, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.resourceCard}
                    onPress={() => handleOpenLink(res.url)}
                  >
                    <View style={styles.resourceInfo}>
                      <Text style={styles.resourceTitle} numberOfLines={1}>{res.title}</Text>
                      <Text style={styles.resourceMeta}>{res.platform || 'Doc'} • {res.type}</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color={colors.inkMuted} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  sheetContainer: {
    backgroundColor: colors.bgPaper,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderColor: colors.ink,
    maxHeight: '85%',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.ink,
    flex: 1
  },
  closeBtn: {
    padding: 4
  },
  content: {
    marginBottom: 10
  },
  description: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: 16
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.ink,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 2
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.ink
  },
  resourcesSection: {
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: 12
  },
  emptyText: {
    fontSize: 14,
    color: colors.inkMuted,
    fontStyle: 'italic'
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  resourceInfo: {
    flex: 1,
    marginRight: 8
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: 2
  },
  resourceMeta: {
    fontSize: 12,
    color: colors.inkMuted
  }
});
