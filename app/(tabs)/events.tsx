import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/ui/Header';
import { Event, useEvents } from '@/context/EventsContext';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { Button, Card, FAB, HelperText, Modal, Portal, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (Platform.OS === 'ios' ? 44 : 56);
  const { events, addEvent, deleteEvent, updateEvent } = useEvents();
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  return (
    <ThemedView style={[styles.container, { paddingTop: headerHeight + 10 }] }>
      <Header title="Events" />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => {
            setEditingEvent(item);
            setNewTitle(item.title);
            setNewDate(item.date);
            setAttempted(false);
            setModalVisible(true);
          }}>
            <Card.Title title={item.title} subtitle={item.date} />
          </Card>
        )}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => {
        setEditingEvent(null);
        setNewTitle('');
        setNewDate('');
        setAttempted(false);
        setModalVisible(true);
      }} />
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          dismissable
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>{editingEvent ? 'Edit Event' : 'Add New Event'}</Text>
          <TextInput
            label="Title"
            value={newTitle}
            onChangeText={setNewTitle}
            style={styles.input}
            error={attempted && !newTitle}
          />
          <HelperText type="error" visible={attempted && !newTitle}>
            Title is required
          </HelperText>
          <TextInput
            label="Date"
            value={newDate}
            onChangeText={setNewDate}
            style={styles.input}
            error={attempted && !newDate}
            showSoftInputOnFocus={false}
            onFocus={() => {
              if (Platform.OS === 'android') {
                DateTimePickerAndroid.open({
                  value: newDate ? new Date(newDate) : new Date(),
                  mode: 'date',
                  onChange: (_event, selectedDate) => {
                    if (_event.type === 'set' && selectedDate) {
                      const iso = selectedDate.toISOString().split('T')[0];
                      setNewDate(iso);
                    }
                  },
                });
              } else {
                setShowPicker(true);
              }
            }}
          />
          <HelperText type="error" visible={attempted && !newDate}>
            Date is required
          </HelperText>
          {Platform.OS === 'ios' && showPicker && (
            <DateTimePicker
              value={newDate ? new Date(newDate) : new Date()}
              mode="date"
              display="default"
              onChange={(_event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  const iso = selectedDate.toISOString().split('T')[0];
                  setNewDate(iso);
                }
              }}
              style={styles.picker}
            />
          )}
          <View style={styles.buttonRow}>
            {editingEvent && (
              <Button
                mode="outlined"
                onPress={() => {
                  deleteEvent(editingEvent.id);
                  setModalVisible(false);
                }}
                style={styles.deleteButton}
              >
                Delete
              </Button>
            )}
            <Button
              mode="contained"
              onPress={() => {
                setAttempted(true);
                if (newTitle && newDate) {
                  if (editingEvent) {
                    updateEvent({ id: editingEvent.id, title: newTitle, date: newDate });
                  } else {
                    addEvent({ id: String(events.length + 1), title: newTitle, date: newDate });
                  }
                  setModalVisible(false);
                }
              }}
              style={styles.saveButton}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 8,
    height: 40,
    flex: 1,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
  },
  picker: {
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    marginRight: 8,
  },
}); 