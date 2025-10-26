import { useState } from 'react'
import { CheckCircle, Copy, ExternalLink, Terminal, Server, Database, Shield } from 'lucide-react'
import { toast } from 'react-hot-toast'

const LaravelSetupGuide = () => {
    const [copiedCommand, setCopiedCommand] = useState('')

    const copyToClipboard = (text, commandName) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedCommand(commandName)
            toast.success(`${commandName} copied to clipboard!`)
            setTimeout(() => setCopiedCommand(''), 2000)
        })
    }

    const setupSteps = [
        {
            title: "1. Install Dependencies",
            icon: <Server className="w-5 h-5 text-blue-600" />,
            commands: [
                "composer install",
                "composer require tymon/jwt-auth"
            ],
            description: "Install Laravel dependencies and JWT authentication"
        },
        {
            title: "2. Environment Configuration",
            icon: <Database className="w-5 h-5 text-green-600" />,
            commands: [
                "cp .env.example .env",
                "php artisan key:generate",
                "php artisan jwt:secret"
            ],
            description: "Configure environment and generate application keys"
        },
        {
            title: "3. Database Setup",
            icon: <Database className="w-5 h-5 text-purple-600" />,
            commands: [
                "php artisan migrate",
                "php artisan db:seed"
            ],
            description: "Run migrations and seed demo data"
        },
        {
            title: "4. Start Laravel Server",
            icon: <Shield className="w-5 h-5 text-orange-600" />,
            commands: [
                "php artisan serve"
            ],
            description: "Start the Laravel development server on port 8000"
        }
    ]

    const apiEndpoints = [
        { method: 'POST', endpoint: '/api/auth/login', description: 'User authentication' },
        { method: 'GET', endpoint: '/api/products', description: 'Get all products' },
        { method: 'GET', endpoint: '/api/categories', description: 'Get all categories' },
        { method: 'GET', endpoint: '/api/brands', description: 'Get all brands' },
        { method: 'GET', endpoint: '/api/users', description: 'Get all users (admin only)' }
    ]

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex items-center mb-6">
                    <Server className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Laravel API Setup Guide</h2>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Complete setup guide for Laravel backend integration
                        </p>
                    </div>
                </div>

                {/* Quick Test */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <Terminal className="w-4 h-4 mr-2" />
                        Quick API Test
                    </h3>
                    <p className="text-blue-800 text-sm mb-3">
                        Test your Laravel API setup with this command:
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <code className="bg-blue-100 px-3 py-2 rounded text-sm flex-1 w-full sm:w-auto">
                            npm run test:api
                        </code>
                        <button
                            onClick={() => copyToClipboard('npm run test:api', 'Test Command')}
                            className="btn-secondary text-xs px-2 py-1 w-full sm:w-auto"
                        >
                            {copiedCommand === 'Test Command' ? 
                                <CheckCircle className="w-3 h-3 mr-1" /> : 
                                <Copy className="w-3 h-3 mr-1" />
                            }
                            Copy
                        </button>
                    </div>
                </div>

                {/* Setup Steps */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Setup Steps</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {setupSteps.map((step, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center mb-3">
                                    {step.icon}
                                    <h4 className="font-medium text-gray-900 ml-2">{step.title}</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{step.description}</p>

                                <div className="space-y-2">
                                    {step.commands.map((command, cmdIndex) => (
                                        <div key={cmdIndex} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                            <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1 font-mono w-full">
                                                {command}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(command, `Step ${index + 1} Command ${cmdIndex + 1}`)}
                                                className="btn-secondary text-xs px-2 py-1 w-full sm:w-auto"
                                                title="Copy command"
                                            >
                                                {copiedCommand === `Step ${index + 1} Command ${cmdIndex + 1}` ?
                                                    <CheckCircle className="w-3 h-3" /> :
                                                    <Copy className="w-3 h-3" />
                                                }
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* API Endpoints */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Available API Endpoints</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-50 rounded-lg">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left p-3 font-medium text-gray-900">Method</th>
                                    <th className="text-left p-3 font-medium text-gray-900">Endpoint</th>
                                    <th className="text-left p-3 font-medium text-gray-900">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apiEndpoints.map((endpoint, index) => (
                                    <tr key={index} className="border-b border-gray-100">
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                                                endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {endpoint.method}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                {endpoint.endpoint}
                                            </code>
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">
                                            {endpoint.description}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Demo Credentials */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Demo Account Credentials</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="bg-white p-3 rounded border">
                            <strong className="text-blue-600">Admin:</strong><br />
                            admin@example.com<br />
                            password
                        </div>
                        <div className="bg-white p-3 rounded border">
                            <strong className="text-green-600">Manager:</strong><br />
                            manager@example.com<br />
                            password
                        </div>
                        <div className="bg-white p-3 rounded border">
                            <strong className="text-purple-600">Sales Staff:</strong><br />
                            sales@example.com<br />
                            password
                        </div>
                        <div className="bg-white p-3 rounded border">
                            <strong className="text-orange-600">Inventory Staff:</strong><br />
                            inventory@example.com<br />
                            password
                        </div>
                    </div>
                </div>

                {/* Environment Configuration */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-3">Required .env Configuration</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <code className="bg-yellow-100 px-2 py-1 rounded mr-2 mb-1 sm:mb-0">DB_DATABASE=stock_inout</code>
                            <span className="text-yellow-800">Database name</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <code className="bg-yellow-100 px-2 py-1 rounded mr-2 mb-1 sm:mb-0">APP_URL=http://localhost:8000</code>
                            <span className="text-yellow-800">Laravel server URL</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <code className="bg-yellow-100 px-2 py-1 rounded mr-2 mb-1 sm:mb-0">JWT_SECRET=your_jwt_secret</code>
                            <span className="text-yellow-800">JWT authentication secret</span>
                        </div>
                    </div>
                </div>

                {/* Troubleshooting */}
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-3">Common Issues & Solutions</h4>
                    <div className="space-y-3 text-sm text-red-800">
                        <div>
                            <strong>❌ CORS errors:</strong>
                            <p>Check <code>config/cors.php</code> allows <code>localhost:3000</code></p>
                        </div>
                        <div>
                            <strong>❌ 401 Unauthorized:</strong>
                            <p>Verify demo users are seeded: <code>php artisan db:seed</code></p>
                        </div>
                        <div>
                            <strong>❌ 404 Not Found:</strong>
                            <p>Ensure API routes are properly defined in <code>routes/api.php</code></p>
                        </div>
                        <div>
                            <strong>❌ 500 Server Error:</strong>
                            <p>Check Laravel logs in <code>storage/logs/laravel.log</code></p>
                        </div>
                        <div>
                            <strong>❌ Database connection:</strong>
                            <p>Verify MySQL is running and database exists</p>
                        </div>
                    </div>
                </div>

                {/* Success Indicators */}
                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-3">✅ Setup Complete When:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                        <li>• Laravel server runs on <code>http://localhost:8000</code></li>
                        <li>• API test command returns success</li>
                        <li>• Login with demo credentials works</li>
                        <li>• Backend status shows "Connected"</li>
                        <li>• All pages load data without errors</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default LaravelSetupGuide