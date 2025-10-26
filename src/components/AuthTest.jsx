import { useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../utils/api'

const AuthTest = () => {
  const [testResults, setTestResults] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    const results = {}

    // Test 1: API Connection
    try {
      const response = await api.get('/system/health')
      results.apiConnection = { success: true, message: 'API connection successful' }
    } catch (error) {
      results.apiConnection = {
        success: false,
        message: `API connection failed: ${error.message}`,
        details: error.response?.data || error.message
      }
    }

    // Test 2: Login Test
    try {
      const loginResponse = await api.post('/auth/login', {
        email: 'admin@example.com',
        password: 'password'
      })

      if (loginResponse.data.success) {
        results.loginTest = { success: true, message: 'Login test successful' }

        // Test 3: Authenticated Request
        try {
          const token = loginResponse.data.data.token
          const authResponse = await api.get('/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          })
          results.authRequest = { success: true, message: 'Authenticated request successful' }
        } catch (authError) {
          results.authRequest = {
            success: false,
            message: 'Authenticated request failed',
            details: authError.response?.data || authError.message
          }
        }
      } else {
        results.loginTest = { success: false, message: 'Login test failed - invalid response' }
      }
    } catch (loginError) {
      results.loginTest = {
        success: false,
        message: 'Login test failed',
        details: loginError.response?.data || loginError.message
      }
    }

    // Test 4: Registration Test
    try {
      const registerResponse = await api.post('/auth/register', {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        password_confirmation: 'password123'
      })

      if (registerResponse.data.success) {
        results.registerTest = { success: true, message: 'Registration test successful' }
      } else {
        results.registerTest = { success: false, message: 'Registration test failed - invalid response' }
      }
    } catch (registerError) {
      results.registerTest = {
        success: false,
        message: 'Registration test failed',
        details: registerError.response?.data || registerError.message
      }
    }

    setTestResults(results)
    setIsLoading(false)

    const successCount = Object.values(results).filter(r => r.success).length
    const totalTests = Object.keys(results).length

    if (successCount === totalTests) {
      toast.success(`All ${totalTests} tests passed!`)
    } else {
      toast.error(`${successCount}/${totalTests} tests passed`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Backend Integration Test</h2>

        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Running Tests...' : 'Run Backend Tests'}
          </button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Test Results:</h3>

            {Object.entries(testResults).map(([testName, result]) => (
              <div
                key={testName}
                className={`p-4 rounded-lg border ${result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 capitalize">
                    {testName.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${result.success
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {result.success ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-500 cursor-pointer">
                      Show Details
                    </summary>
                    <pre className="text-xs text-gray-600 mt-2 bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Backend Requirements:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Laravel API running on http://localhost:8000</li>
            <li>• CORS configured to allow requests from http://localhost:3000</li>
            <li>• Authentication endpoints: /api/auth/login, /api/auth/register</li>
            <li>• Health check endpoint: /api/system/health (optional)</li>
            <li>• JWT or Sanctum authentication configured</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AuthTest