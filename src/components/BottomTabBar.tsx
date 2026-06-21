import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = ComponentProps<typeof Ionicons>['name'];

const iconNames: Record<string, { active: IconName; inactive: IconName }> = {
  index: { active: 'home', inactive: 'home-outline' },
  workout: { active: 'barbell', inactive: 'barbell-outline' },
  progress: { active: 'trending-up', inactive: 'trending-up-outline' },
  settings: { active: 'settings', inactive: 'settings-outline' },
};

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <SafeAreaView className="border-t border-outline bg-surface" edges={['bottom']}>
      <View className="h-16 flex-row items-stretch px-5">
        {state.routes.map((route, index) => {
          const active = state.index === index;
          const options = descriptors[route.key].options;
          const label = options.title ?? route.name;
          const icons = iconNames[route.name] ?? iconNames.index;

          function navigate() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!active && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          return (
            <Pressable
              accessibilityLabel={options.tabBarAccessibilityLabel}
              accessibilityRole="button"
              accessibilityState={active ? { selected: true } : {}}
              className={
                'flex-1 items-center justify-center gap-1 border-t-2 pt-1 active:opacity-70 ' +
                (active ? 'border-primary' : 'border-transparent')
              }
              key={route.key}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              onPress={navigate}
            >
              <Ionicons
                color={active ? '#0058bc' : '#414755'}
                name={active ? icons.active : icons.inactive}
                size={23}
              />
              <Text className={'text-[11px] font-bold ' + (active ? 'text-primary' : 'text-on-surface-variant')}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
