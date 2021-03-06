import React, { useState, useContext, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import UserContext from '../context/UserContext';
import axios from 'axios';
import ErrorNotice from '../components/ErrorNotice';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: ''
  });

  const { userData, setUserData, setSpotifyAuth } = useContext(UserContext);
  const { username, password, password2 } = formData;
  const [error, setError] = useState();
  const history = useHistory();

  // function that sets the formData state to equal whatever input is in the forms
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // function that async sends a post request to our backend with the registration data and also sends a post request for a login token
  const onSubmit = async (e) => {
    // prevent default form refresh on input submission
    e.preventDefault();

    // check if register password and confirmed register password are not the same
    if (password !== password2) {
      // set error if they don't  match
      setError('passwords do not match');
    } else {
      //post request to backend with registration data
      try {
        await axios.post(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/auth/register`,
          formData
        );

        // post request to backend with user data to get jwt token and information on user
        const loginRes = await axios.post(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/auth/login`,
          {
            username,
            password
          }
        );

        // set the userData state to be the token, id and recipes we've gotten back
        setUserData({
          token: loginRes.data.token,
          user: loginRes.data._id,
          recipes: loginRes.data.recipes
        });
        // set spotifyAuth to false as new user
        setSpotifyAuth(false);
        // set the jwt token in local storage
        localStorage.setItem('auth-token', loginRes.data.token);
        history.push('/');
      } catch (err) {
        const msg = err.response.data.msg || 'Login error (500)';
        console.log(msg);
        msg && setError(err.response.data.msg);
      }
    }
  };

  // on load if a user is currently loaded in userData state then send us to homepage
  useEffect(() => {
    if (userData.user) history.push('/');
  });

  return (
    <div>
      <h1>Register</h1>
      {/* if error exists then render it */}
      {error && (
        <ErrorNotice message={error} clearError={() => setError(undefined)} />
      )}
      {/* form for entering a username, will call onSubmit to post data when submit input is clicked */}
      <form onSubmit={(e) => onSubmit(e)} className='form'>
        <label>Username</label>
        <input
          type='text'
          placeholder=''
          name='username'
          // front end validation for required
          required
          value={username}
          onChange={(e) => onChange(e)}
          data-cy='register-username'
        />
        <label>Password</label>
        <input
          type='password'
          placeholder=''
          required
          name='password'
          value={password}
          onChange={(e) => onChange(e)}
          //front end validation for minimum length
          minLength='6'
          data-cy='register-password'
        />
        <input
          type='password'
          placeholder='Confirm Password'
          required
          name='password2'
          value={password2}
          onChange={(e) => onChange(e)}
          minLength='6'
          data-cy='register-password2'
        />
        <input type='submit' value='Register' data-cy='register-button' />
      </form>
      <p>
        Already have an account?
        {/* link to login route */}
        <Link data-cy='login-link' to='/login'>
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
