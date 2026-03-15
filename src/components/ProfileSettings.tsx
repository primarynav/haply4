import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  User, 
  MapPin, 
  CreditCard, 
  Heart, 
  Settings,
  Save,
  Edit,
  Camera,
  Shield,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSettingsProps {
  user: { name: string; email: string };
  onSave: (data: any) => void;
}

export function ProfileSettings({ user, onSave }: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState('personal');
  
  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    name: user.name,
    email: user.email,
    age: '35',
    gender: 'male',
    phone: '',
    bio: '',
    occupation: '',
    education: '',
    height: '',
    children: 'yes',
    divorceYear: '2022',
    relationshipGoals: 'long-term'
  });

  // Match Criteria State
  const [matchCriteria, setMatchCriteria] = useState({
    ageRangeMin: '28',
    ageRangeMax: '45',
    maxDistance: '50',
    genderPreference: 'female',
    hasChildren: 'any',
    education: 'any',
    interests: ['Travel', 'Cooking', 'Reading']
  });

  // Address State
  const [addressInfo, setAddressInfo] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States'
  });

  // Billing State
  const [billingInfo, setBillingInfo] = useState({
    subscription: 'premium',
    cardNumber: '**** **** **** 1234',
    expiryDate: '12/25',
    billingAddress: 'Same as primary address',
    autoRenew: true
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    profileViews: false,
    promotions: true,
    emailUpdates: true
  });

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleMatchCriteriaChange = (field: string, value: string) => {
    setMatchCriteria(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setAddressInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (section: string) => {
    // Simulate save
    toast.success(`${section} settings saved successfully!`);
    onSave({ personalInfo, matchCriteria, addressInfo, billingInfo, notifications });
  };

  const addInterest = (interest: string) => {
    if (interest && !matchCriteria.interests.includes(interest)) {
      setMatchCriteria(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setMatchCriteria(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-8 w-8 text-rose-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account preferences and match criteria</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="matching" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Matching</span>
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Address</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Update your basic information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={personalInfo.name}
                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={personalInfo.age}
                    onChange={(e) => handlePersonalInfoChange('age', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={personalInfo.gender}
                    onValueChange={(value) => handlePersonalInfoChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={personalInfo.occupation}
                    onChange={(e) => handlePersonalInfoChange('occupation', e.target.value)}
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Select
                    value={personalInfo.education}
                    onValueChange={(value) => handlePersonalInfoChange('education', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="some-college">Some College</SelectItem>
                      <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                      <SelectItem value="masters">Master's Degree</SelectItem>
                      <SelectItem value="doctorate">Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Select
                    value={personalInfo.height}
                    onValueChange={(value) => handlePersonalInfoChange('height', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select height" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4-10">4'10"</SelectItem>
                      <SelectItem value="4-11">4'11"</SelectItem>
                      <SelectItem value="5-0">5'0"</SelectItem>
                      <SelectItem value="5-1">5'1"</SelectItem>
                      <SelectItem value="5-2">5'2"</SelectItem>
                      <SelectItem value="5-3">5'3"</SelectItem>
                      <SelectItem value="5-4">5'4"</SelectItem>
                      <SelectItem value="5-5">5'5"</SelectItem>
                      <SelectItem value="5-6">5'6"</SelectItem>
                      <SelectItem value="5-7">5'7"</SelectItem>
                      <SelectItem value="5-8">5'8"</SelectItem>
                      <SelectItem value="5-9">5'9"</SelectItem>
                      <SelectItem value="5-10">5'10"</SelectItem>
                      <SelectItem value="5-11">5'11"</SelectItem>
                      <SelectItem value="6-0">6'0"</SelectItem>
                      <SelectItem value="6-1">6'1"</SelectItem>
                      <SelectItem value="6-2">6'2"</SelectItem>
                      <SelectItem value="6-3">6'3"</SelectItem>
                      <SelectItem value="6-4">6'4"</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="divorceYear">Year of Divorce</Label>
                  <Input
                    id="divorceYear"
                    type="number"
                    value={personalInfo.divorceYear}
                    onChange={(e) => handlePersonalInfoChange('divorceYear', e.target.value)}
                    min="1990"
                    max="2024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="children">Do you have children?</Label>
                <Select
                  value={personalInfo.children}
                  onValueChange={(value) => handlePersonalInfoChange('children', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes, living with me</SelectItem>
                    <SelectItem value="yes-not-living">Yes, not living with me</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="grown">Yes, but they're grown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationshipGoals">Relationship Goals</Label>
                <Select
                  value={personalInfo.relationshipGoals}
                  onValueChange={(value) => handlePersonalInfoChange('relationshipGoals', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual dating</SelectItem>
                    <SelectItem value="serious">Serious relationship</SelectItem>
                    <SelectItem value="long-term">Long-term commitment</SelectItem>
                    <SelectItem value="marriage">Marriage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={personalInfo.bio}
                  onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}
                  placeholder="Tell others about yourself..."
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  {personalInfo.bio.length}/500 characters
                </p>
              </div>

              <Button onClick={() => handleSave('Personal information')} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Personal Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Match Criteria Tab */}
        <TabsContent value="matching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Match Criteria</span>
              </CardTitle>
              <CardDescription>
                Set your preferences for potential matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={matchCriteria.ageRangeMin}
                      onChange={(e) => handleMatchCriteriaChange('ageRangeMin', e.target.value)}
                      min="18"
                      max="100"
                      className="w-20"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      value={matchCriteria.ageRangeMax}
                      onChange={(e) => handleMatchCriteriaChange('ageRangeMax', e.target.value)}
                      min="18"
                      max="100"
                      className="w-20"
                    />
                    <span>years old</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDistance">Maximum Distance</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="maxDistance"
                      type="number"
                      value={matchCriteria.maxDistance}
                      onChange={(e) => handleMatchCriteriaChange('maxDistance', e.target.value)}
                      min="1"
                      max="500"
                      className="w-20"
                    />
                    <span>miles</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genderPreference">Looking for</Label>
                  <Select
                    value={matchCriteria.genderPreference}
                    onValueChange={(value) => handleMatchCriteriaChange('genderPreference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Women</SelectItem>
                      <SelectItem value="male">Men</SelectItem>
                      <SelectItem value="both">Any gender</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hasChildren">Children preference</Label>
                  <Select
                    value={matchCriteria.hasChildren}
                    onValueChange={(value) => handleMatchCriteriaChange('hasChildren', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">No preference</SelectItem>
                      <SelectItem value="yes">Has children</SelectItem>
                      <SelectItem value="no">No children</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="education">Education preference</Label>
                  <Select
                    value={matchCriteria.education}
                    onValueChange={(value) => handleMatchCriteriaChange('education', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">No preference</SelectItem>
                      <SelectItem value="high-school">High school or higher</SelectItem>
                      <SelectItem value="college">College or higher</SelectItem>
                      <SelectItem value="bachelors">Bachelor's degree or higher</SelectItem>
                      <SelectItem value="graduate">Graduate degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {matchCriteria.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="cursor-pointer">
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add an interest..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addInterest((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add an interest..."]') as HTMLInputElement;
                      if (input && input.value) {
                        addInterest(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <Button onClick={() => handleSave('Match criteria')} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Match Criteria
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Address Information</span>
              </CardTitle>
              <CardDescription>
                Update your location details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={addressInfo.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={addressInfo.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="Seattle"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={addressInfo.state}
                    onValueChange={(value) => handleAddressChange('state', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AL">Alabama</SelectItem>
                      <SelectItem value="AK">Alaska</SelectItem>
                      <SelectItem value="AZ">Arizona</SelectItem>
                      <SelectItem value="AR">Arkansas</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="CO">Colorado</SelectItem>
                      <SelectItem value="CT">Connecticut</SelectItem>
                      <SelectItem value="DE">Delaware</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="GA">Georgia</SelectItem>
                      <SelectItem value="HI">Hawaii</SelectItem>
                      <SelectItem value="ID">Idaho</SelectItem>
                      <SelectItem value="IL">Illinois</SelectItem>
                      <SelectItem value="IN">Indiana</SelectItem>
                      <SelectItem value="IA">Iowa</SelectItem>
                      <SelectItem value="KS">Kansas</SelectItem>
                      <SelectItem value="KY">Kentucky</SelectItem>
                      <SelectItem value="LA">Louisiana</SelectItem>
                      <SelectItem value="ME">Maine</SelectItem>
                      <SelectItem value="MD">Maryland</SelectItem>
                      <SelectItem value="MA">Massachusetts</SelectItem>
                      <SelectItem value="MI">Michigan</SelectItem>
                      <SelectItem value="MN">Minnesota</SelectItem>
                      <SelectItem value="MS">Mississippi</SelectItem>
                      <SelectItem value="MO">Missouri</SelectItem>
                      <SelectItem value="MT">Montana</SelectItem>
                      <SelectItem value="NE">Nebraska</SelectItem>
                      <SelectItem value="NV">Nevada</SelectItem>
                      <SelectItem value="NH">New Hampshire</SelectItem>
                      <SelectItem value="NJ">New Jersey</SelectItem>
                      <SelectItem value="NM">New Mexico</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="NC">North Carolina</SelectItem>
                      <SelectItem value="ND">North Dakota</SelectItem>
                      <SelectItem value="OH">Ohio</SelectItem>
                      <SelectItem value="OK">Oklahoma</SelectItem>
                      <SelectItem value="OR">Oregon</SelectItem>
                      <SelectItem value="PA">Pennsylvania</SelectItem>
                      <SelectItem value="RI">Rhode Island</SelectItem>
                      <SelectItem value="SC">South Carolina</SelectItem>
                      <SelectItem value="SD">South Dakota</SelectItem>
                      <SelectItem value="TN">Tennessee</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="UT">Utah</SelectItem>
                      <SelectItem value="VT">Vermont</SelectItem>
                      <SelectItem value="VA">Virginia</SelectItem>
                      <SelectItem value="WA">Washington</SelectItem>
                      <SelectItem value="WV">West Virginia</SelectItem>
                      <SelectItem value="WI">Wisconsin</SelectItem>
                      <SelectItem value="WY">Wyoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={addressInfo.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    placeholder="98101"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={addressInfo.country}
                    onValueChange={(value) => handleAddressChange('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={() => handleSave('Address information')} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Address Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Billing & Subscription</span>
              </CardTitle>
              <CardDescription>
                Manage your subscription and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-rose-800">Premium Subscription</h4>
                    <p className="text-rose-600">$29.99/month • Next billing: Dec 15, 2024</p>
                  </div>
                  <Badge className="bg-rose-600 text-white">Active</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Payment Method</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-6 w-6 text-gray-400" />
                      <div>
                        <p className="font-medium">**** **** **** 1234</p>
                        <p className="text-sm text-gray-500">Expires 12/25</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Billing History</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">Premium Subscription</p>
                      <p className="text-sm text-gray-500">Nov 15, 2024</p>
                    </div>
                    <span className="font-medium">$29.99</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">Premium Subscription</p>
                      <p className="text-sm text-gray-500">Oct 15, 2024</p>
                    </div>
                    <span className="font-medium">$29.99</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoRenew">Auto-renewal</Label>
                    <p className="text-sm text-gray-500">
                      Automatically renew your subscription each month
                    </p>
                  </div>
                  <Switch
                    id="autoRenew"
                    checked={billingInfo.autoRenew}
                    onCheckedChange={(checked) => 
                      setBillingInfo(prev => ({ ...prev, autoRenew: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1">
                  Downgrade to Free
                </Button>
                <Button variant="destructive" className="flex-1">
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose what notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newMatches">New Matches</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when you have new potential matches
                    </p>
                  </div>
                  <Switch
                    id="newMatches"
                    checked={notifications.newMatches}
                    onCheckedChange={(checked) => handleNotificationChange('newMatches', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="messages">Messages</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when you receive new messages
                    </p>
                  </div>
                  <Switch
                    id="messages"
                    checked={notifications.messages}
                    onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profileViews">Profile Views</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when someone views your profile
                    </p>
                  </div>
                  <Switch
                    id="profileViews"
                    checked={notifications.profileViews}
                    onCheckedChange={(checked) => handleNotificationChange('profileViews', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="promotions">Promotions</Label>
                    <p className="text-sm text-gray-500">
                      Receive updates about special offers and new features
                    </p>
                  </div>
                  <Switch
                    id="promotions"
                    checked={notifications.promotions}
                    onCheckedChange={(checked) => handleNotificationChange('promotions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailUpdates">Email Updates</Label>
                    <p className="text-sm text-gray-500">
                      Receive weekly digest emails with activity summaries
                    </p>
                  </div>
                  <Switch
                    id="emailUpdates"
                    checked={notifications.emailUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('emailUpdates', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('Notification preferences')} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}