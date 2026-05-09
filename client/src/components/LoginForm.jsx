import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client/react';

import { LOGIN_USER } from '../utils/mutations';
import Auth from '../utils/auth';

const LoginForm = ({ handleModalClose }) => {
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });
  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [loginUser] = useMutation(LOGIN_USER);

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
      const email = userFormData.email.trim().toLowerCase();
      const { data } = await loginUser({
        variables: { email, password: userFormData.password },
      });
      Auth.login(data.login.token);
      handleModalClose?.();
      setShowAlert(false);
    } catch {
      setShowAlert(true);
    }

    setUserFormData({
      email: '',
      password: '',
    });
  };

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
          Something went wrong with your login credentials!
        </Alert>
        <Form.Group controlId='login-email' className='mb-3'>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type='email'
            placeholder='Your email'
            name='email'
            autoComplete='email'
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId='login-password' className='mb-3'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            autoComplete='current-password'
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(userFormData.email && userFormData.password)}
          type='submit'
          variant='success'>
          Log In
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;
