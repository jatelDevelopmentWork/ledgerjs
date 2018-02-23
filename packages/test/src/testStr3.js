import Str from "@ledgerhq/hw-app-str";

export default async transport => {
  const str = new Str(transport);
  const transaction = Buffer.from(
    "7ac33997544e3175d266bd022439b22cdb16508c01163f26e5cb2a3e1045a979000000020000000020da998b75e42b1f7f85d075c127f5b246df12ad96f010bcf7f76f72b16e57130000006400c5b4a5000000190000000000000000000000010000000000000001000000009541f02746240c1e9f3843d28e56f0a583ecd27502fb0f4a27d4d0922fe064a200000000000000000098968000000000",
    "hex"
  );
  // const transaction = Buffer.from("cee0302d59844d32bdca915c8203dd44b33fbb7edc19051ea37abedf28ecd47200000002000000004c19884ffd8da276e5c2e054bf43c3a197884311d5ed2bd3c8f813b1b8476d2b00000064004d31cf0000000100000000000000000000000100000000000000050000000100000000cd4eb80f3b5f4ed04b2762349cdf7df25862ca115c4bcaed647ca8c228ecfd7b000000010000000600000001000000010000000100000000000000010000000100000001000000020000000100000003000000010000000f7777772e6578616d706c652e636f6d000000000100000000cd4eb80f3b5f4ed04b2762349cdf7df25862ca115c4bcaed647ca8c228ecfd7b0000000100000000", "hex");
  return await str.signTransaction("44'/148'/0'", transaction);
};