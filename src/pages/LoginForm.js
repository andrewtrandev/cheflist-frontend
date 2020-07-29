import React, { useState, useContext, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import UserContext from '../context/UserContext';
import axios from 'axios';
import ErrorNotice from '../components/ErrorNotice';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { userData, setUserData, setSpotifyAuth } = useContext(UserContext);
  const history = useHistory();
  const { username, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const loginRes = await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/auth/login`,
        formData
      );
      // console.log(loginRes);
      setUserData({
        token: loginRes.data.token,
        user: loginRes.data._id,
        recipes: loginRes.data.recipes,
      });
      localStorage.setItem('auth-token', loginRes.data.token);

      if (loginRes.data.spotifyAuth) {
        await axios
          .post(
            `${process.env.REACT_APP_BACKEND_BASE_URL}/spotify/refresh`,
            {
              id: loginRes.data._id,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'x-auth-token': loginRes.data.token,
              },
            }
          )
          .then((data) => {
            setSpotifyAuth(data.data.access_token);
            console.log('access_token added');
            history.push('/');
          });
      }
    } catch (err) {
      // console.log(err.response.data);
      const msg = err.response.data.msg;
      msg && setError(msg);
    }
  };

  useEffect(() => {
    if (userData.user) history.push('/');
  });

  return (
    <div>
      <h1>Sign In</h1>
      {error && (
        <ErrorNotice message={error} clearError={() => setError(undefined)} />
      )}
      <form onSubmit={(e) => onSubmit(e)} className='form'>
        <label>Username</label>
        <input
          type='text'
          placeholder='Username'
          name='username'
          required
          value={username}
          onChange={(e) => onChange(e)}
          data-cy='login'
        />
        <label>Password</label>
        <input
          type='password'
          placeholder='Password'
          required
          name='password'
          value={password}
          onChange={(e) => onChange(e)}
          minLength='6'
          data-cy='password'
        />

        <input type='submit' value='Login' data-cy='login-button' />
      </form>
      <p>
        Don't have an account?{' '}
        <Link to='/register' data-cy='sign-up-link'>
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
