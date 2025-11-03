import React from 'react';
import { formatDate } from '../utils/dateFormatter';
import '../styles/Table.css';

const ContactRow = ({ contact, isSelected, onSelect }) => {
  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  return (
    <tr className={isSelected ? 'selected-row' : ''}>
      <td className="checkbox-col">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(contact.id)}
        />
      </td>
      <td>
        <div className="contact-cell">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="avatar"
          />
          <div className="contact-info">
            <div className="contact-name">{contact.name}</div>
            <div className="contact-email">{contact.email}</div>
          </div>
        </div>
      </td>
      <td>{contact.phone}</td>
      <td>
        <span className={`score-badge ${getScoreClass(contact.score)}`}>
          {contact.score}
        </span>
      </td>
      <td>{formatDate(contact.lastMessageAt)}</td>
      <td>{contact.addedBy}</td>
    </tr>
  );
};

export default ContactRow;
