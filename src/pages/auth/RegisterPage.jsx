import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Package, Mail, Lock, User, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { authService } from '../../services/authService'
import { toast } from 'react-hot-toast'

const RegisterPage = () => {
    const { isAuthenticated, isLoading } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [registerError, setRegisterError] = useState('')
    const [registerSuccess, setRegisterSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm()

    const password = watch('password')

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        setRegisterError('')

        try {
            const response = await authService.register(data)
            if (response.data.success) {
                setRegisterSuccess(true)
                toast.success('Account created successfully! Please login to continue.')
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.'
            setRegisterError(message)
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (registerSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
                    <p className="text-gray-600 mb-6">
                        Your account has been created successfully. You can now sign in with your credentials.
                    </p>
                    <Link to="/login" className="btn-primary w-full justify-center">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-6">
                            <Package className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">
                            Join Our Platform
                        </h1>
                        <p className="text-xl text-primary-100 leading-relaxed">
                            Create your account and start managing your inventory with our powerful tools.
                            Get access to comprehensive features designed for modern businesses.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center text-primary-100">
                            <div className="w-2 h-2 bg-primary-300 rounded-full mr-3"></div>
                            <span>Advanced inventory management</span>
                        </div>
                        <div className="flex items-center text-primary-100">
                            <div className="w-2 h-2 bg-primary-300 rounded-full mr-3"></div>
                            <span>Multi-user collaboration</span>
                        </div>
                        <div className="flex items-center text-primary-100">
                            <div className="w-2 h-2 bg-primary-300 rounded-full mr-3"></div>
                            <span>Real-time analytics</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-white">
                <div className="max-w-md w-full space-y-6 sm:space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center">
                        <div className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-4">
                            <Package className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                        <p className="text-gray-600">Join us today</p>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:block">
                        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                        <p className="mt-2 text-gray-600">Please fill in your information</p>
                    </div>

                    {/* Error Message */}
                    {registerError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                            <span className="text-red-700 text-sm">{registerError}</span>
                        </div>
                    )}

                    <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        {...register('name', {
                                            required: 'Full name is required',
                                            minLength: {
                                                value: 2,
                                                message: 'Name must be at least 2 characters',
                                            },
                                        })}
                                        type="text"
                                        className="input pl-10"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: 'Please enter a valid email address',
                                            },
                                        })}
                                        type="email"
                                        className="input pl-10"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number (Optional)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        {...register('phone', {
                                            pattern: {
                                                value: /^[\+]?[1-9][\d]{0,15}$/,
                                                message: 'Please enter a valid phone number',
                                            },
                                        })}
                                        type="tel"
                                        className="input pl-10"
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 8,
                                                message: 'Password must be at least 8 characters',
                                            },
                                            pattern: {
                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                                            },
                                        })}
                                        type={showPassword ? 'text' : 'password'}
                                        className="input pl-10 pr-10"
                                        placeholder="Create a strong password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        {...register('password_confirmation', {
                                            required: 'Please confirm your password',
                                            validate: value => value === password || 'Passwords do not match',
                                        })}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="input pl-10 pr-10"
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                    Address (Optional)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        {...register('address')}
                                        rows={3}
                                        className="input pl-10 resize-none"
                                        placeholder="Enter your address"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                {...register('terms', {
                                    required: 'You must accept the terms and conditions',
                                })}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                I agree to the{' '}
                                <a href="#" className="text-primary-600 hover:text-primary-500">
                                    Terms and Conditions
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-primary-600 hover:text-primary-500">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>
                        {errors.terms && (
                            <p className="text-sm text-red-600">{errors.terms.message}</p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        <span className="ml-2">Creating account...</span>
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <span className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                                    Sign in
                                </Link>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage