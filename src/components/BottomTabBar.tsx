import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const iconNames: Record<string, { active: IconName; inactive: IconName }> = {
  index: { active: "home", inactive: "home-outline" },
  workout: { active: "barbell", inactive: "barbell-outline" },
  progress: { active: "trending-up", inactive: "trending-up-outline" },
  settings: { active: "settings", inactive: "settings-outline" },
};

export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <SafeAreaView
      className="absolute bottom-0 left-0 right-0 bg-transparent px-4 pb-3 pt-2"
      edges={["bottom"]}
      pointerEvents="box-none"
    >
      <View
        className="h-[72px] flex-row items-center rounded-[30px] border px-2 shadow-sm"
        pointerEvents="auto"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.88)",
          borderColor: "rgba(0, 88, 188, 0.18)",
          boxShadow: "0 18px 36px rgba(19, 27, 46, 0.18)",
        }}
      >
        {state.routes.map((route, index) => {
          const active = state.index === index;
          const options = descriptors[route.key].options;
          const label = options.title ?? route.name;
          const icons = iconNames[route.name] ?? iconNames.index;

          function navigate() {
            const event = navigation.emit({
              type: "tabPress",
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
                "h-14 flex-1 items-center justify-center gap-1 rounded-3xl active:opacity-75 " +
                (active ? "bg-surface-container-low" : "bg-transparent")
              }
              key={route.key}
              onLongPress={() =>
                navigation.emit({ type: "tabLongPress", target: route.key })
              }
              onPress={navigate}
            >
              <Ionicons
                color={active ? "#0058bc" : "#414755"}
                name={active ? icons.active : icons.inactive}
                size={22}
              />
              <Text
                className={
                  "text-[10px] font-extrabold " +
                  (active ? "text-primary" : "text-on-surface-variant")
                }
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
