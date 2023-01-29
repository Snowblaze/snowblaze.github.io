import { useState, useCallback } from 'react';
import {
  Box,
  Stack,
  FormControl,
  Input,
  Button,
  Heading,
  Text,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

const regex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((?!-)([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{1,})[^-<>()[\].,;:\s@"]$/i;
const endpoint = '/api/subscribe';

const Newsletter = () => {
  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  );
  const [error, setError] = useState(false);

  const onSubmit = useCallback(async (e: any) => {
    e.preventDefault();

    const value = e.target.email.value;

    if (regex.exec(value)) {
      setError(false);
      setState('submitting');

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: value,
        }),
      };

      const response = await fetch(endpoint, options);

      if (response.status === 200) {
        setState('success');
        return;
      }
    }

    setError(true);
    setState('initial');
  }, [
    setError,
    setState,
  ]);

  return (
      <Box
        border="1px solid #eaeaea"
        rounded="2xl"
        p={6}
        flexDir="column"
      >
        <Heading
          as="h2"
          fontSize={{ base: 'xl', sm: '2xl' }}
          textAlign="center"
          mb={5}
        >
          Get notified about new posts
        </Heading>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          as="form"
          spacing="12px"
          onSubmit={onSubmit}
        >
          <FormControl>
            <Input
              variant="solid"
              borderWidth={1}
              color="gray.800"
              _placeholder={{
                color: 'gray.400',
              }}
              borderColor="gray.300"
              id="email"
              type="email"
              required
              placeholder="Your Email"
              aria-label="Your Email"
              disabled={state !== 'initial'}
            />
          </FormControl>
          <FormControl w={{ base: '100%', md: '40%' }}>
            <Button
              colorScheme={state === 'success' ? 'green' : 'blue'}
              isLoading={state === 'submitting'}
              w="100%"
              type={state === 'success' ? 'button' : 'submit'}>
              {state === 'success' ? <CheckIcon /> : 'Submit'}
            </Button>
          </FormControl>
        </Stack>
        <Text
          mt={2}
          textAlign="center"
          color={error ? 'red.500' : 'gray.500'}>
          {error
            ? "Oh no an error occured! Please try again later."
            : "You won't receive any spam!"}
        </Text>
      </Box>
  );
};

export default Newsletter;
