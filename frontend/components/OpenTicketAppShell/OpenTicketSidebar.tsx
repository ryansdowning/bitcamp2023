import { useDark, useUser } from "../../utilities/hooks";
import { ColorSchemeToggle } from "../ColorSchemeToggle/ColorSchemeToggle";
import { OverlayContext } from "./OpenTicketAppShell";
import {
  Navbar,
  Stack,
  Text,
  Avatar,
  Group,
  Divider,
  Center,
  UnstyledButton,
  Collapse,
  Button,
  useMantineTheme,
  Badge,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconBuildingBank, IconCaretDown, IconCurrencyDollar, IconDashboard } from "@tabler/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const SIDEBAR_X_PADDING = 11;
const SIDEBAR_TRANSITION = 100;
const COLLAPSED_SIDEBAR_WIDTH = 60;
const EXPANDED_SIDEBAR_WIDTH = 300;
const COMING_SOON_BADGE = <Badge size="xs">COMING SOON</Badge>;
const UNDER_CONSTRUCTION_BADGE = (
  <Badge size="xs" color="yellow.7">
    UNDER CONSTRUCTION
  </Badge>
);
const BETA_BADGE = (
  <Badge size="xs" color="violet.8">
    BETA
  </Badge>
);

export interface AbstractSideBarItem {
  title: string;
  comingSoon?: boolean;
  beta?: boolean;
  underConstruction?: boolean;
  onClick?: () => void;
}

export interface SidebarItemLink extends AbstractSideBarItem {
  link: string;
}

export interface OpenTicketSidebarMenuItemProps extends AbstractSideBarItem {
  icon: ReactNode;
  link?: string;
  sublinks?: SidebarItemLink[];
}

export function OpenTicketSidebarMenuItem({
  title,
  icon,
  sublinks,
  link,
  comingSoon,
  beta,
  onClick,
  underConstruction,
}: OpenTicketSidebarMenuItemProps) {
  const [opened, setOpened] = useState(false);
  const router = useRouter();
  const sidebarOpened = useContext(isSidebarOpenedContext);
  const theme = useMantineTheme();

  // Reset the dropdown when sidebar closes.
  useEffect(() => {
    // Compute whether or not we are currently in a sublink's page.
    let shouldOpen = false;
    sublinks?.forEach((sublink) => {
      if (window.location.href.endsWith(sublink.link)) shouldOpen = true;
    });

    // If we're in a sublink's page, open the item when the sidebar is opened.
    if (sidebarOpened) {
      setOpened(shouldOpen);
    } else {
      setOpened(false);
    }
  }, [sidebarOpened]);

  return (
    <Stack onClick={onClick}>
      <Button
        variant="subtle"
        onClick={() => !comingSoon && !underConstruction && (link ? router.push(link) : setOpened((o) => !o))}
        styles={{
          root: {
            padding: 0,
            color: "inherit",
          },
          inner: {
            justifyContent: "space-between",
            flexGrow: 1,
          },
          label: {
            width: "100%",
          },
        }}
      >
        <Group
          sx={(theme) => ({
            width: "100%",
            color: underConstruction
              ? theme.colors.yellow[7]
              : (link && typeof window !== "undefined" && window.location.href.endsWith(link)) ||
                (sublinks && opened)
              ? theme.colors.blue[7]
              : "inherit",
          })}
          position="apart"
          pr={20}
          align="center"
        >
          <Group>
            <Center sx={{ width: COLLAPSED_SIDEBAR_WIDTH - SIDEBAR_X_PADDING * 2 }}>{icon}</Center>
            <Text>{title}</Text>
          </Group>
          {sublinks && (
            <IconCaretDown
              style={{ float: "left" }}
              stroke={1}
              size={16}
              fill={opened ? theme.colors.blue[7] : "inherit"}
            />
          )}
          {comingSoon && COMING_SOON_BADGE}
          {beta && BETA_BADGE}
          {underConstruction && UNDER_CONSTRUCTION_BADGE}
        </Group>
      </Button>

      {sublinks && (
        <Collapse in={opened}>
          <Stack pl={50}>
            {sublinks.map((sublink, i) => (
              <Link
                href={sublink.comingSoon || sublink.underConstruction ? window.location.href : sublink.link}
                key={i}
                passHref
              >
                <UnstyledButton component="a">
                  <Group sx={{ width: "100%" }} position="apart" pr={20}>
                    <Text
                      sx={{
                        textDecoration: "none",
                        color: window.location.href.includes(sublink.link) ? theme.colors.blue[7] : "inherit",
                      }}
                    >
                      {sublink.title}
                    </Text>
                    {sublink.comingSoon && COMING_SOON_BADGE}
                    {sublink.beta && BETA_BADGE}
                    {sublink.underConstruction && UNDER_CONSTRUCTION_BADGE}
                  </Group>
                </UnstyledButton>
              </Link>
            ))}
          </Stack>
        </Collapse>
      )}
    </Stack>
  );
}

const isSidebarOpenedContext = createContext<boolean>(false);

export function OpenTicketSidebar() {
  const { hovered, ref } = useHover();
  const [, setOverlay] = useContext(OverlayContext);
  const dark = useDark();
  const [user] = useUser();

  const DIVIDER = (
    <Divider
      sx={{
        width: hovered ? "100%" : COLLAPSED_SIDEBAR_WIDTH - SIDEBAR_X_PADDING * 2,
        transition: `${SIDEBAR_TRANSITION}ms`,
      }}
    />
  );

  useEffect(() => {
    setOverlay(hovered);
  }, [hovered]);

  return (
    <isSidebarOpenedContext.Provider value={hovered}>
      <Navbar
        width={{
          base: hovered ? EXPANDED_SIDEBAR_WIDTH : COLLAPSED_SIDEBAR_WIDTH,
        }}
        py={35}
        px={SIDEBAR_X_PADDING}
        sx={{
          transition: `${SIDEBAR_TRANSITION}ms`,
          overflowX: "hidden",
          overflowY: hovered ? "auto" : "hidden",
        }}
        ref={ref}
      >
        <Stack sx={{ width: EXPANDED_SIDEBAR_WIDTH - SIDEBAR_X_PADDING * 2 - 1 }}>
          {/* Profile. */}
          <Group align="center">
            <Avatar src={null} alt="profile picture" color="blue" sx={{ cursor: "pointer" }} />

            <Stack spacing={0}>
              <Text size={16}>
                {user?.first_name} {user?.last_name}
              </Text>
            </Stack>
          </Group>

          {DIVIDER}
          <OpenTicketSidebarMenuItem title="Dashboard" icon={<IconDashboard stroke={1} />} link={`/`} />
        </Stack>
      </Navbar>
    </isSidebarOpenedContext.Provider>
  );
}
