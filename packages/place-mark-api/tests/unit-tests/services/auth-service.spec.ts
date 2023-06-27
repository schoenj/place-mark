import jwt from "jsonwebtoken";
import { assert } from "chai";
import { User } from "@prisma/client";
import { IUserReadOnlyDto } from "@schoenj/place-mark-core";
import { IApplicationConfig } from "../../../app/config/interfaces/index.js";
import { IUserRepository } from "../../../app/repositories/interfaces/index.js";
import { AuthService } from "../../../app/services/index.js";
import { testConfig } from "../controllers/test-setup.js";

suite("AuthService Unit-Tests", () => {
  test("validate$ should work", async () => {
    const expected = {
      id: "646634e51d85e59154d725c5",
      admin: false,
      email: "test@test.de",
    } as IUserReadOnlyDto;
    let repoCalled = false;
    const repo = {
      getById$(id: string): Promise<IUserReadOnlyDto | null> {
        assert.isFalse(repoCalled);
        repoCalled = true;
        assert.equal(id, expected.id);
        return Promise.resolve(expected);
      },
    } as IUserRepository;
    const service = new AuthService(testConfig, repo);

    let result = await service.validate$(undefined);
    assert.isFalse(result.isValid);
    assert.isFalse(repoCalled);

    result = await service.validate$({});
    assert.isFalse(result.isValid);
    assert.isFalse(repoCalled);

    result = await service.validate$({ id: expected.id });
    assert.isTrue(result.isValid);
    assert.isTrue(repoCalled);
    assert.isTrue("credentials" in result);
    const { credentials } = result;
    assert.isNotNull(credentials);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    assert.isTrue("user" in credentials!);
    assert.equal(credentials?.user?.id, expected.id);
    assert.equal(credentials?.user?.admin, expected.admin);
    assert.equal(credentials?.user?.email, expected.email);
    assert.isTrue(repoCalled);
  });

  test("authenticate$ should work", async () => {
    const repo = {
      getByEmail$(email: string): Promise<User | null> {
        if (email === "should-work@test.de") {
          return Promise.resolve({
            id: "646634e51d85e59154d725c5",
            admin: true,
            email: "should-work@test.de",
            password: "1234",
          } as User);
        }

        if (email === "should-not-work@test.de") {
          return Promise.resolve(null);
        }

        assert.fail("Wrong email provided");
        throw new Error();
      },
    } as IUserRepository;
    const service = new AuthService(testConfig, repo);

    let result = await service.authenticate$({ email: "should-not-work@test.de", password: "asd" });
    assert.isNotNull(result);
    assert.isFalse(result.success);
    assert.isFalse("user" in result);

    result = await service.authenticate$({ email: "should-work@test.de", password: "asd" });
    assert.isNotNull(result);
    assert.isFalse(result.success);
    assert.isFalse("user" in result);

    result = await service.authenticate$({ email: "should-work@test.de", password: "1234" });
    assert.isNotNull(result);
    assert.isTrue(result.success);
    assert.isTrue("user" in result);
    const authUser = "user" in result ? result.user : null;
    assert.isNotNull(authUser);
    assert.equal(authUser?.id, "646634e51d85e59154d725c5");
    assert.equal(authUser?.email, "should-work@test.de");
    assert.isTrue(authUser?.admin);
  });

  test("createToken should work", () => {
    const config = {
      jwt: {
        algorithm: "HS256",
        expiresIn: 60 * 60,
        password: "1234",
      },
    } as IApplicationConfig;
    const repo = {} as IUserRepository;

    const service = new AuthService(config, repo);
    const currentTimestamp = new Date();
    const token = service.createToken({
      id: "646634e51d85e59154d725c5",
      email: "some-email@email.com",
      admin: false,
    });

    const decoded = jwt.verify(token, config.jwt.password);
    assert.isObject(decoded);

    const decodedObject = decoded as object;

    // Id
    const id = "id" in decodedObject && typeof decodedObject.id === "string" ? (decodedObject.id as string) : null;
    assert.isNotNull(id);
    assert.equal(id, "646634e51d85e59154d725c5");

    // Email
    const email = "email" in decodedObject && typeof decodedObject.email === "string" ? (decodedObject.email as string) : null;
    assert.isNotNull(email);
    assert.equal(email, "some-email@email.com");

    // Admin-Flag
    const admin = "admin" in decodedObject && typeof decodedObject.admin === "boolean" ? decodedObject.admin : null;
    assert.isNotNull(admin);
    assert.isFalse(admin);

    // IssuedAt
    const issuedAt = "iat" in decodedObject && typeof decodedObject.iat === "number" ? new Date(decodedObject.iat * 1000) : null;
    assert.isNotNull(issuedAt);
    const issuedAtMin = new Date(currentTimestamp.getTime() - 1000);
    const issuedAtMax = new Date(currentTimestamp.getTime() + 60 * 1000);
    assert.isTrue((issuedAt as Date) >= issuedAtMin);
    assert.isTrue((issuedAt as Date) <= issuedAtMax);

    // ExpiresAt
    const expiresAt = "exp" in decodedObject && typeof decodedObject.exp === "number" ? new Date(decodedObject.exp * 1000) : null;
    assert.isNotNull(expiresAt);
    const expiresMin = new Date(currentTimestamp.getTime() + 59 * 60 * 1000);
    const expiresMax = new Date(currentTimestamp.getTime() + 61 * 60 * 1000);
    assert.isTrue((expiresAt as Date) > expiresMin);
    assert.isTrue((expiresAt as Date) < expiresMax);
  });
});
