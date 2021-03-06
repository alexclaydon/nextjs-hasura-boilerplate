import React, { useState, FormEvent } from "react";
import gql from "graphql-tag";
import { useMutation } from "urql";
import {
  Box,
  Stack,
  FormControl,
  FormLabel,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  CloseButton,
  Textarea,
  useColorMode,
} from "@chakra-ui/core";
import { useSession } from "next-auth/client";
import AccessDeniedIndicator from "components/access-denied-indicator";

const insertFeedMutation = gql`
  mutation insertFeed($author_id: uuid!, $body: String) {
    insert_feeds_one(object: { author_id: $author_id, body: $body }) {
      id
    }
  }
`;

const AddNewFeedForm = () => {
  const { colorMode } = useColorMode();
  const bgColor = { light: "white", dark: "gray.800" };
  const color = { light: "gray.800", dark: "gray.100" };
  const [body, setBody] = useState("");
  const [session] = useSession();

  if (!session) {
    return (
      <AccessDeniedIndicator message="You need to be signed in to add a new feed!" />
    );
  }

  const [
    { fetching: insertFeedFetching, error: insertFeedError },
    insertFeed,
  ] = useMutation(insertFeedMutation);

  const handleSubmit = async () => {
    await insertFeed({
      author_id: session.id,
      body,
    });

    setBody("");
  };

  const errorNode = () => {
    if (!insertFeedError) {
      return false;
    }

    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>{insertFeedError}</AlertTitle>
        <CloseButton position="absolute" right="8px" top="8px" />
      </Alert>
    );
  };

  return (
    <Stack spacing={4}>
      {errorNode()}
      <Box
        p={4}
        bg={bgColor[colorMode]}
        color={color[colorMode]}
        shadow="lg"
        rounded="lg"
      >
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="body">What's on your mind?</FormLabel>
            <Textarea
              id="body"
              value={body}
              onChange={(e: FormEvent<HTMLInputElement>) =>
                setBody(e.currentTarget.value)
              }
              isDisabled={insertFeedFetching}
            />
          </FormControl>
          <FormControl>
            <Button
              loadingText="Posting..."
              onClick={handleSubmit}
              isLoading={insertFeedFetching}
              isDisabled={!body.trim()}
            >
              Post
            </Button>
          </FormControl>
        </Stack>
      </Box>
    </Stack>
  );
};

export default AddNewFeedForm;
