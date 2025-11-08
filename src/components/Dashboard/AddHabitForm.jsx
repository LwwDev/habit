import React, { useState } from 'react';
import styles from './AddHabitForm.module.css';

const AddHabitForm = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [hasReminder, setHasReminder] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      description: description.trim(),
      reminderTime: hasReminder ? reminderTime : null,
      hasReminder
    });

    setName('');
    setDescription('');
    setReminderTime('09:00');
    setHasReminder(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="name">Habit Name *</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Exercise, Read, Meditate"
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for this habit"
          rows="3"
        />
      </div>

      <div className={styles.checkboxGroup}>
        <label>
          <input
            type="checkbox"
            checked={hasReminder}
            onChange={(e) => setHasReminder(e.target.checked)}
          />
          Set reminder
        </label>
        {hasReminder && (
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className={styles.timeInput}
          />
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Cancel
        </button>
        <button type="submit" className={styles.submitButton}>
          Add Habit
        </button>
      </div>
    </form>
  );
};

export default AddHabitForm;

