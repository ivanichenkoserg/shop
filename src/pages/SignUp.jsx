import React, { useState } from 'react';
import { auth, db } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import ReCAPTCHA from 'react-google-recaptcha'; 

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      toast.error("Please verify the CAPTCHA.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name || user.displayName || '',
        profilePic: profilePic || '',
        cart: [],
      });

      dispatch(setUser(user));
      toast.success("Sign up successful!");
      navigate('/');
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (provider) => {
    if (!captchaVerified) {
      toast.error("Please verify the CAPTCHA.");
      return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName || '',
        profilePic: user.photoURL || '',
        cart: [],
      }, { merge: true });

      dispatch(setUser(user));
      toast.success("Sign up successful!");
      navigate('/');
    } catch (error) {
      console.error("Error with social sign up:", error);
      toast.error(error.message || "An error occurred.");
    }
  };

  const handleCaptchaVerification = (value) => {
    setCaptchaVerified(!!value);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 pt-20"> {/* Added pt-20 for top padding */}
      <form
        onSubmit={handleSignUp}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-3xl font-semibold text-center mb-6">Sign Up</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="url"
          placeholder="Profile Picture URL"
          value={profilePic}
          onChange={(e) => setProfilePic(e.target.value)}
          className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-4 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <ReCAPTCHA
          sitekey="6Lf63EoqAAAAAJLVIpWdZmg-pri-kVm-Lw2a2m5E" 
          onChange={handleCaptchaVerification}
          className="mb-4"
        />
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold ${loading || !captchaVerified ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          disabled={loading || !captchaVerified}
        >
          {loading ? "Processing..." : "Sign Up"}
        </button>
        <div className="mt-4">
          <button 
            onClick={() => handleSocialSignUp(new GoogleAuthProvider())}
            className={`w-full bg-red-500 text-white py-2 rounded-lg mb-2 ${!captchaVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!captchaVerified}
          >
            Sign up with Google
          </button>
          <button
            onClick={() => handleSocialSignUp(new GithubAuthProvider())}
            className={`w-full bg-gray-800 text-white py-2 rounded-lg mb-2 ${!captchaVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!captchaVerified}
          >
            Sign up with Github
          </button>
          <button
            onClick={() => handleSocialSignUp(new FacebookAuthProvider())}
            className={`w-full bg-blue-700 text-white py-2 rounded-lg ${!captchaVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!captchaVerified}
          >
            Sign up with Facebook
          </button>
        </div>
        <p className="mt-4 text-center text-gray-600">
          Already have an account? <a href="/signin" className="text-blue-600 hover:underline">Sign In</a>
        </p>
      </form>
    </div>
  );
}

export default SignUp;