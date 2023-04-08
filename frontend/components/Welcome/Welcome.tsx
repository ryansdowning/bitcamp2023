import useStyles from "./Welcome.styles";
import { Title, Text, Stack } from "@mantine/core";

export function Welcome() {
  const { classes } = useStyles();

  return (
    <Stack align="center">
      <Title className={classes.title} align="center" mt={100}>
        Welcome to{" "}
        <Text inherit variant="gradient" component="span">
          Bitcamp 2023
        </Text>
      </Title>
    </Stack>
  );
}
