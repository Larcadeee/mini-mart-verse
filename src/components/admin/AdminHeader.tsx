
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Settings, BarChart3, Package, Users, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  adminUser: any;
  onSignOut: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminHeader = ({ adminUser, onSignOut, activeTab, onTabChange }: AdminHeaderProps) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'buyers', label: 'Buyers', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: CreditCard }
  ];

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">MiniMart Online</p>
              </div>
            </div>

            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => onTabChange(tab.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{adminUser.full_name}</p>
              <Badge variant="secondary" className="text-xs">Administrator</Badge>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/buyer-dashboard')}
            >
              <Settings className="h-4 w-4 mr-2" />
              View Site
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
