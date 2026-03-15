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
  User, Heart, Settings, Save, Camera, Shield, Bell, Upload, Lock, AlertTriangle, X, Eye, EyeOff 
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProfileSettingsCompleteProps {
  user: { name: string; email: string };
  onSave: (data: any) => void;
}

export function ProfileSettingsComplete({ user, onSave }: ProfileSettingsCompleteProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [profilePhotos, setProfilePhotos] = useState<string[]>(['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']);
  const [newInterest, setNewInterest] = useState('');
  
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

  const [matchCriteria, setMatchCriteria] = useState({
    ageRangeMin: '28',
    ageRangeMax: '45',
    maxDistance: '50',
    genderPreference: 'female',
    hasChildren: 'any',
    education: 'any',
    interests: ['Travel', 'Cooking', 'Reading']
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'everyone',
    showAge: true,
    showLocation: true,
    showLastActive: false,
    allowMessages: 'matches',
    twoFactorAuth: false
  });

  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    profileViews: false,
    promotions: true,
    emailUpdates: true,
    push: true
  });

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleMatchCriteriaChange = (field: string, value: string) => {
    setMatchCriteria(prev => ({ ...prev, [field]: value }));
  };

  const handlePrivacyChange = (field: string, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && matchCriteria.interests.length < 10 && !matchCriteria.interests.includes(newInterest.trim())) {
      setMatchCriteria(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setMatchCriteria(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && profilePhotos.length < 6) {
      toast.success('Photo uploaded successfully!');
      setProfilePhotos(prev => [...prev, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setProfilePhotos(prev => prev.filter((_, i) => i !== index));
    toast.success('Photo removed');
  };

  const handleSavePersonal = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b484abd/profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: user.email,
            profile: { ...personalInfo, photos: profilePhotos }
          })
        }
      );

      if (response.ok) {
        toast.success('Profile updated successfully!');
        onSave(personalInfo);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error updating profile');
    }
  };

  const handleSavePreferences = async () => {
    toast.success('Match preferences saved!');
  };

  const handleSavePrivacy = async () => {
    toast.success('Privacy settings saved!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile, preferences, and privacy</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="personal"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
          <TabsTrigger value="photos"><Camera className="w-4 h-4 mr-2" />Photos</TabsTrigger>
          <TabsTrigger value="preferences"><Heart className="w-4 h-4 mr-2" />Preferences</TabsTrigger>
          <TabsTrigger value="privacy"><Shield className="w-4 h-4 mr-2" />Privacy</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={personalInfo.name} onChange={(e) => handlePersonalInfoChange('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" value={personalInfo.age} onChange={(e) => handlePersonalInfoChange('age', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={personalInfo.gender} onValueChange={(val) => handlePersonalInfoChange('gender', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input id="occupation" value={personalInfo.occupation} onChange={(e) => handlePersonalInfoChange('occupation', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Select value={personalInfo.education} onValueChange={(val) => handlePersonalInfoChange('education', val)}>
                    <SelectTrigger><SelectValue placeholder="Select education" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                      <SelectItem value="masters">Master's Degree</SelectItem>
                      <SelectItem value="doctorate">Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input id="height" value={personalInfo.height} onChange={(e) => handlePersonalInfoChange('height', e.target.value)} placeholder="5'10&quot;" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={personalInfo.bio}
                  onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={5}
                  maxLength={500}
                />
                <p className="text-sm text-gray-500">{personalInfo.bio.length}/500 characters</p>
              </div>

              <Button onClick={handleSavePersonal} className="w-full">
                <Save className="w-4 h-4 mr-2" />Save Personal Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Photos</CardTitle>
              <CardDescription>Add up to 6 photos (first photo is your main profile picture)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {profilePhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group">
                    <img src={photo} alt={`Profile ${index + 1}`} className="w-full h-full object-cover" />
                    {index === 0 && (<div className="absolute top-2 left-2 bg-rose-500 text-white text-xs px-2 py-1 rounded">Main</div>)}
                    <button onClick={() => handleRemovePhoto(index)} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {profilePhotos.length < 6 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-rose-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Match Preferences</CardTitle>
              <CardDescription>Set your criteria for potential matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Age Range</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Input type="number" value={matchCriteria.ageRangeMin} onChange={(e) => handleMatchCriteriaChange('ageRangeMin', e.target.value)} className="w-24" />
                    <span className="text-gray-500">to</span>
                    <Input type="number" value={matchCriteria.ageRangeMax} onChange={(e) => handleMatchCriteriaChange('ageRangeMax', e.target.value)} className="w-24" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Maximum Distance (miles)</Label>
                  <Input type="number" value={matchCriteria.maxDistance} onChange={(e) => handleMatchCriteriaChange('maxDistance', e.target.value)} className="w-32" />
                </div>

                <div className="space-y-2">
                  <Label>Looking For</Label>
                  <Select value={matchCriteria.genderPreference} onValueChange={(val) => handleMatchCriteriaChange('genderPreference', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Men</SelectItem>
                      <SelectItem value="female">Women</SelectItem>
                      <SelectItem value="both">Everyone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {matchCriteria.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="pr-1">
                        {interest}
                        <button onClick={() => handleRemoveInterest(interest)} className="ml-1 hover:text-rose-600">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                    />
                    <Button onClick={handleAddInterest} variant="outline">Add</Button>
                  </div>
                </div>
              </div>

              <Button onClick={handleSavePreferences} className="w-full">
                <Save className="w-4 h-4 mr-2" />Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Control who can see your profile and how you interact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select value={privacySettings.profileVisibility} onValueChange={(val) => handlePrivacyChange('profileVisibility', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="matches">Matches Only</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Age</Label>
                    <p className="text-sm text-gray-500">Display your age on your profile</p>
                  </div>
                  <Switch checked={privacySettings.showAge} onCheckedChange={(val) => handlePrivacyChange('showAge', val)} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Location</Label>
                    <p className="text-sm text-gray-500">Display your city/distance</p>
                  </div>
                  <Switch checked={privacySettings.showLocation} onCheckedChange={(val) => handlePrivacyChange('showLocation', val)} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add extra security</p>
                  </div>
                  <Switch checked={privacySettings.twoFactorAuth} onCheckedChange={(val) => handlePrivacyChange('twoFactorAuth', val)} />
                </div>

                <Separator />

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">Block & Report</h4>
                      <p className="text-sm text-amber-800 mb-3">
                        Block users or report inappropriate behavior to keep Haply safe.
                      </p>
                      <Button variant="outline" size="sm" className="text-amber-900 border-amber-300">
                        <Shield className="w-4 h-4 mr-2" />View Blocked Users
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSavePrivacy} className="w-full">
                <Save className="w-4 h-4 mr-2" />Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what updates you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Matches</Label>
                  <p className="text-sm text-gray-500">Get notified when someone likes you back</p>
                </div>
                <Switch checked={notifications.newMatches} onCheckedChange={(val) => handleNotificationChange('newMatches', val)} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Messages</Label>
                  <p className="text-sm text-gray-500">Get notified when you receive a message</p>
                </div>
                <Switch checked={notifications.messages} onCheckedChange={(val) => handleNotificationChange('messages', val)} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive mobile push notifications</p>
                </div>
                <Switch checked={notifications.push} onCheckedChange={(val) => handleNotificationChange('push', val)} />
              </div>
              <Button onClick={() => toast.success('Notification preferences saved!')} className="w-full mt-6">
                <Save className="w-4 h-4 mr-2" />Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}