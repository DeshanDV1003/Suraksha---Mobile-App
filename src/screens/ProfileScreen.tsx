import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar, List, Divider } from 'react-native-paper';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white">
      <View className="items-center py-10 bg-primary">
        <Avatar.Icon size={80} icon="account" />
        <Text className="text-white text-xl font-bold mt-4">Guest User</Text>
        <Text className="text-blue-100 italic">Colombo, Sri Lanka</Text>
      </View>

      <List.Section>
        <List.Subheader>Account Settings</List.Subheader>
        <List.Item
          title="Edit Profile"
          left={(props) => <List.Icon {...props} icon="account-edit" />}
        />
        <List.Item
          title="My Reports"
          left={(props) => <List.Icon {...props} icon="file-document" />}
        />
        <Divider />
        <List.Subheader>App</List.Subheader>
        <List.Item
          title="Notifications"
          left={(props) => <List.Icon {...props} icon="bell" />}
        />
        <List.Item
          title="Help & Support"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
        />
      </List.Section>
    </View>
  );
}
