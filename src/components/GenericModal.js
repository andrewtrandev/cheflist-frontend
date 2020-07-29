import React from 'react';

import Modal from './Modal';

const GenericModal = (props) => {
  return (
    <Modal
      onCancel={props.onClear}
      header={props.header}
      show={!!props.message}
      footer={
        <button data-cy='modal-footer' onClick={props.onClear}>
          Okay
        </button>
      }
    >
      <p>{props.message}</p>
    </Modal>
  );
};

export default GenericModal;
