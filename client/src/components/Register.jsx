import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, User, Shield } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { username, password, confirmPassword } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const res = await axios.post('/api/auth/register', { username, password });
            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-2 text-center">Create Account</h2>
                <p className="text-gray-400 text-center mb-6">Join the Resilience Platform</p>
                
                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input 
                                type="text" 
                                name="username" 
                                value={username} 
                                onChange={onChange}
                                className="w-full bg-gray-900 border border-gray-700 text-white p-3 pl-10 rounded-lg focus:outline-hidden focus:border-indigo-500"
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input 
                                type="password" 
                                name="password" 
                                value={password} 
                                onChange={onChange}
                                className="w-full bg-gray-900 border border-gray-700 text-white p-3 pl-10 rounded-lg focus:outline-hidden focus:border-indigo-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Confirm Password</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                value={confirmPassword} 
                                onChange={onChange}
                                className="w-full bg-gray-900 border border-gray-700 text-white p-3 pl-10 rounded-lg focus:outline-hidden focus:border-indigo-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-bold transition-colors"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
