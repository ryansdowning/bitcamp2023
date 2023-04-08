import { changePassword } from "../../utilities/authentication";
import { Breakpoint, useBreakpoint } from "../../utilities/hooks";
import { OpenTicketSidebar } from "./OpenTicketSidebar";
import { AppShellProps, Button, Modal, Text, TextInput, Group, Overlay } from "@mantine/core";
import { AppShell } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ModalsProvider } from "@mantine/modals";
import Head from "next/head";
import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";

export interface OpenTicketAppShellProps extends AppShellProps {
  pt?: number;
  pl?: number;
  pr?: number;
  pb?: number;
  title?: string;
}

export const OverlayContext = createContext<[boolean, Dispatch<SetStateAction<boolean>>]>([
  false,
  (_) => true,
]);

export function OpenTicketAppShell({ children, pt, pl, pr, pb, title, ...others }: OpenTicketAppShellProps) {
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const breakpoint = useBreakpoint();

  const resetPasswordForm = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isResetOpen) resetPasswordForm.reset();
  }, [isResetOpen]);

  function getPadding(breakpoint: Breakpoint) {
    if (breakpoint.smallerThan("sm")) {
      return [20, 20];
    }
    if (breakpoint.smallerThan("md")) {
      return [40, 40];
    }
    if (breakpoint.smallerThan("lg")) {
      return [60, 60];
    }
    if (breakpoint.smallerThan("xl")) {
      return [80, 80];
    }
    return [100, 100];
  }

  return (
    <OverlayContext.Provider value={[overlay, setOverlay]}>
      <ModalsProvider>
        <AppShell
          navbar={<OpenTicketSidebar />}
          styles={(theme) => ({
            main: {
              backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
              paddingTop: pt != undefined ? pt : getPadding(breakpoint)[1],
              paddingLeft: (pl != undefined ? pl : getPadding(breakpoint)[0]) + 60,
              paddingRight: pr != undefined ? pr : getPadding(breakpoint)[0],
              paddingBottom: pb != undefined ? pb : getPadding(breakpoint)[1],
            },
          })}
          padding={0}
          {...others}
        >
          <Head>
            <title>{title ? title : "OpenTicket Dashboard"}</title>
          </Head>
          {overlay && <Overlay opacity={0.6} color="#000" zIndex={5} sx={{ position: "fixed" }} />}
          <Modal
            opened={isResetOpen}
            onClose={() => setIsResetOpen(false)}
            centered={true}
            withCloseButton={false}
          >
            <form
              onSubmit={resetPasswordForm.onSubmit((values) =>
                changePassword(values.currentPassword, values.newPassword, values.confirmPassword)
                  ?.then(() => setIsResetOpen(false))
                  .catch((resp) =>
                    resp.response.status === 403
                      ? resetPasswordForm.setErrors({
                          currentPassword: resp.response.data.message,
                        })
                      : resetPasswordForm.setErrors({
                          confirmPassword: resp.response.data.message,
                        })
                  )
              )}
            >
              <Text size={24} mb={10}>
                Change your password
              </Text>
              <TextInput
                label="Current Password"
                placeholder="Current Password"
                {...resetPasswordForm.getInputProps("currentPassword")}
                type="password"
                required={true}
              />
              <TextInput
                label="New Password"
                placeholder="New Password"
                {...resetPasswordForm.getInputProps("newPassword")}
                type="password"
                my={10}
                required={true}
              />
              <TextInput
                label="Confirm Password"
                placeholder="Confirm Password"
                {...resetPasswordForm.getInputProps("confirmPassword")}
                type="password"
                required={true}
              />
              <Group position="right" mt={10}>
                <Button onClick={() => setIsResetOpen(false)} variant="outline">
                  Cancel
                </Button>
                <Button type="submit">Change Password</Button>
              </Group>
            </form>
          </Modal>
          {children}
        </AppShell>
      </ModalsProvider>
    </OverlayContext.Provider>
  );
}
