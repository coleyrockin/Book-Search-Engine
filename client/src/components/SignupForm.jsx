import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client/react';

import { ADD_USER } from '../utils/mutations';
import Auth from '../utils/auth';

const SignupForm = ({ handleModalClose }) => {
  // set initial form state
  const [userFormData, setUserFormData] = useState({ username: '', email: '', password: '' });
  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [addUser] = useMutation(ADD_USER);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    setValidated(true);
    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }

    try {
      const variables = {
        username: userFormData.username.trim(),
        email: userFormData.email.trim().toLowerCase(),
        password: userFormData.password,
      };
      const { data } = await addUser({
        variables,
      });

      Auth.login(data.addUser.token);
      handleModalClose?.();
      setShowAlert(false);
    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }

    setUserFormData({
      username: '',
      email: '',
      password: '',
    });
  };

  return (
    <>
      {/* This is needed for the validation functionality above */}
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        {/* show alert if server response is bad */}
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
          Something went wrong with your signup!
        </Alert>

        <Form.Group controlId='signup-username' className='mb-3'>
          <Form.Label>Username</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your username'
            name='username'
            autoComplete='username'
            onChange={handleInputChange}
            value={userFormData.username}
            required
          />
          <Form.Control.Feedback type='invalid'>Username is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId='signup-email' className='mb-3'>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type='email'
            placeholder='Your email address'
            name='email'
            autoComplete='email'
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId='signup-password' className='mb-3'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            autoComplete='new-password'
            onChange={handleInputChange}
            value={userFormData.password}
            minLength={8}
            required
          />
          <Form.Control.Feedback type='invalid'>
            Password must be at least 8 characters.
          </Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(userFormData.username && userFormData.email && userFormData.password)}
          type='submit'
          variant='success'>
          Create Account
        </Button>
      </Form>
    </>
  );
};

export default SignupForm;
