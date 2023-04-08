import { login } from "../utilities/authentication";
import { makeRequest } from "../utilities/networking";
import { HOMEPAGE_URL, URL_ROOT } from "../utilities/urls";
import { Button, Modal, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Modal centered={true} opened={true} onClose={() => {}} withCloseButton={false}>
      <form
        onSubmit={form.onSubmit((values) =>
          makeRequest(
            "POST",
            URL_ROOT,
            "auth/token/",
            {
              email: values.email,
              password: values.password,
            },
            false,
            false
          )
            ?.then((data) => login(true, data.token))
            .then(() => router.push(HOMEPAGE_URL))
            ?.catch((err) =>
              err.response?.data?.non_field_errors
                ? form.setErrors({
                    password: err.response.data.non_field_errors[0],
                  })
                : form.setErrors({
                    email: err.response?.data.message,
                  })
            )
        )}
      >
        <Title order={4}>Welcome to Bryce</Title>
        <TextInput
          label="Email"
          description="Your email"
          placeholder="johnny@apple.com"
          {...form.getInputProps("email")}
        />
        <TextInput
          label="Password"
          placeholder="********"
          type="password"
          {...form.getInputProps("password")}
        />
        <Button type="submit" mt={10}>
          Log In
        </Button>
      </form>
    </Modal>
  );
}
