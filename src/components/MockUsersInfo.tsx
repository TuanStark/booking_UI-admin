import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../components/ui/badge';
import { Copy, Check } from 'lucide-react';

const MockUsersInfo: React.FC = () => {
  const mockUsers = [
    {
      email: 'admin@dormitory.com',
      password: 'admin123',
      role: 'admin',
      description: 'Full access to all features'
    }
  ];

  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Mock Authentication Data</span>
          <Badge variant="secondary">Development Only</Badge>
        </CardTitle>
        <CardDescription>
          Use these credentials to test the authentication system. Click the copy button to copy credentials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-1">
          {mockUsers.map((user, index) => (
            <Card key={index} className="border-2 border-dashed border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg capitalize">{user.role}</CardTitle>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {user.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Email
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="flex-1 px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {user.email}
                    </code>
                    <button
                      onClick={() => copyToClipboard(user.email, index * 2)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {copiedIndex === index * 2 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="flex-1 px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {user.password}
                    </code>
                    <button
                      onClick={() => copyToClipboard(user.password, index * 2 + 1)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {copiedIndex === index * 2 + 1 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Go to the login page</li>
            <li>Use any of the email/password combinations above</li>
            <li>You'll be logged in with the corresponding role</li>
            <li>Test different role-based access controls</li>
          </ol>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Note:</h4>
          <p className="text-sm text-yellow-800">
            This mock data is only available in development mode. 
            Set <code className="bg-yellow-100 px-1 rounded">VITE_USE_MOCK_DATA=false</code> 
            to use real API endpoints.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MockUsersInfo;
