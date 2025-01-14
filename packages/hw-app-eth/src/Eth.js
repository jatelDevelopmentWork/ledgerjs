"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/********************************************************************************
 *   Ledger Node JS API
 *   (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/
// FIXME drop:
var utils_1 = require("./utils");
var logs_1 = require("@ledgerhq/logs");
var errors_1 = require("@ledgerhq/errors");
var ethers_1 = require("ethers");
var erc20_1 = require("./erc20");
var contracts_1 = require("./contracts");
var starkQuantizationTypeMap = {
    eth: 1,
    erc20: 2,
    erc721: 3,
    erc20mintable: 4,
    erc721mintable: 5
};
function hexBuffer(str) {
    return Buffer.from(str.startsWith("0x") ? str.slice(2) : str, "hex");
}
function maybeHexBuffer(str) {
    if (!str)
        return null;
    return hexBuffer(str);
}
var remapTransactionRelatedErrors = function (e) {
    if (e && e.statusCode === 0x6a80) {
        return new errors_1.EthAppPleaseEnableContractData("Please enable Contract data on the Ethereum app Settings");
    }
    return e;
};
/**
 * Ethereum API
 *
 * @example
 * import Eth from "@ledgerhq/hw-app-eth";
 * const eth = new Eth(transport)
 */
var Eth = /** @class */ (function () {
    function Eth(transport, scrambleKey) {
        if (scrambleKey === void 0) { scrambleKey = "w0w"; }
        this.transport = transport;
        transport.decorateAppAPIMethods(this, [
            "getAddress",
            "provideERC20TokenInformation",
            "signTransaction",
            "signPersonalMessage",
            "getAppConfiguration",
            "signEIP712HashedMessage",
            "starkGetPublicKey",
            "starkSignOrder",
            "starkSignOrder_v2",
            "starkSignTransfer",
            "starkSignTransfer_v2",
            "starkProvideQuantum",
            "starkProvideQuantum_v2",
            "starkUnsafeSign",
            "eth2GetPublicKey",
            "eth2SetWithdrawalIndex",
            "setExternalPlugin",
        ], scrambleKey);
    }
    /**
     * get Ethereum address for a given BIP 32 path.
     * @param path a path in BIP 32 format
     * @option boolDisplay optionally enable or not the display
     * @option boolChaincode optionally enable or not the chaincode request
     * @return an object with a publicKey, address and (optionally) chainCode
     * @example
     * eth.getAddress("44'/60'/0'/0/0").then(o => o.address)
     */
    Eth.prototype.getAddress = function (path, boolDisplay, boolChaincode) {
        var paths = utils_1.splitPath(path);
        var buffer = Buffer.alloc(1 + paths.length * 4);
        buffer[0] = paths.length;
        paths.forEach(function (element, index) {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        return this.transport
            .send(0xe0, 0x02, boolDisplay ? 0x01 : 0x00, boolChaincode ? 0x01 : 0x00, buffer)
            .then(function (response) {
            var publicKeyLength = response[0];
            var addressLength = response[1 + publicKeyLength];
            return {
                publicKey: response.slice(1, 1 + publicKeyLength).toString("hex"),
                address: "0x" +
                    response
                        .slice(1 + publicKeyLength + 1, 1 + publicKeyLength + 1 + addressLength)
                        .toString("ascii"),
                chainCode: boolChaincode
                    ? response
                        .slice(1 + publicKeyLength + 1 + addressLength, 1 + publicKeyLength + 1 + addressLength + 32)
                        .toString("hex")
                    : undefined
            };
        });
    };
    /**
     * This commands provides a trusted description of an ERC 20 token
     * to associate a contract address with a ticker and number of decimals.
     *
     * It shall be run immediately before performing a transaction involving a contract
     * calling this contract address to display the proper token information to the user if necessary.
     *
     * @param {*} info: a blob from "erc20.js" utilities that contains all token information.
     *
     * @example
     * import { byContractAddress } from "@ledgerhq/hw-app-eth/erc20"
     * const zrxInfo = byContractAddress("0xe41d2489571d322189246dafa5ebde1f4699f498")
     * if (zrxInfo) await appEth.provideERC20TokenInformation(zrxInfo)
     * const signed = await appEth.signTransaction(path, rawTxHex)
     */
    Eth.prototype.provideERC20TokenInformation = function (_a) {
        var data = _a.data;
        return provideERC20TokenInformation(this.transport, data);
    };
    /**
     * You can sign a transaction and retrieve v, r, s given the raw transaction and the BIP 32 path of the account to sign
     * @example
     eth.signTransaction("44'/60'/0'/0/0", "e8018504e3b292008252089428ee52a8f3d6e5d15f8b131996950d7f296c7952872bd72a2487400080").then(result => ...)
     */
    Eth.prototype.signTransaction = function (path, rawTxHex) {
        return __awaiter(this, void 0, void 0, function () {
            var paths, offset, rawTx, toSend, response, rlpTx, rlpOffset, chainIdPrefix, rlpVrs, sizeOfListLen, chainIdSrc, chainIdBuf, _loop_1, decodedTx, provideForContract, selector, infos, plugin, payload, signature, erc20OfInterest, abi, contract, args, _i, erc20OfInterest_1, address;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        paths = utils_1.splitPath(path);
                        offset = 0;
                        rawTx = Buffer.from(rawTxHex, "hex");
                        toSend = [];
                        rlpTx = ethers_1.ethers.utils.RLP.decode("0x" + rawTxHex).map(function (hex) {
                            return Buffer.from(hex.slice(2), "hex");
                        });
                        rlpOffset = 0;
                        chainIdPrefix = "";
                        if (rlpTx.length > 6) {
                            rlpVrs = Buffer.from(ethers_1.ethers.utils.RLP.encode(rlpTx.slice(-3)).slice(2), "hex");
                            rlpOffset = rawTx.length - (rlpVrs.length - 1);
                            // First byte > 0xf7 means the length of the list length doesn't fit in a single byte.
                            if (rlpVrs[0] > 0xf7) {
                                // Increment rlpOffset to account for that extra byte.
                                rlpOffset++;
                                sizeOfListLen = rlpVrs[0] - 0xf7;
                                // Increase rlpOffset by the size of the list length.
                                rlpOffset += sizeOfListLen - 1;
                            }
                            chainIdSrc = rlpTx[6];
                            chainIdBuf = Buffer.alloc(4);
                            chainIdSrc.copy(chainIdBuf, 4 - chainIdSrc.length);
                            chainIdPrefix = (chainIdBuf.readUInt32BE(0) * 2 + 35)
                                .toString(16)
                                .slice(0, -2);
                            // Drop the low byte, that comes from the ledger.
                            if (chainIdPrefix.length % 2 === 1) {
                                chainIdPrefix = "0" + chainIdPrefix;
                            }
                        }
                        _loop_1 = function () {
                            var maxChunkSize = offset === 0 ? 150 - 1 - paths.length * 4 : 150;
                            var chunkSize = offset + maxChunkSize > rawTx.length
                                ? rawTx.length - offset
                                : maxChunkSize;
                            if (rlpOffset != 0 && offset + chunkSize == rlpOffset) {
                                // Make sure that the chunk doesn't end right on the EIP 155 marker if set
                                chunkSize--;
                            }
                            var buffer = Buffer.alloc(offset === 0 ? 1 + paths.length * 4 + chunkSize : chunkSize);
                            if (offset === 0) {
                                buffer[0] = paths.length;
                                paths.forEach(function (element, index) {
                                    buffer.writeUInt32BE(element, 1 + 4 * index);
                                });
                                rawTx.copy(buffer, 1 + 4 * paths.length, offset, offset + chunkSize);
                            }
                            else {
                                rawTx.copy(buffer, 0, offset, offset + chunkSize);
                            }
                            toSend.push(buffer);
                            offset += chunkSize;
                        };
                        while (offset !== rawTx.length) {
                            _loop_1();
                        }
                        rlpTx = ethers_1.ethers.utils.RLP.decode("0x" + rawTxHex);
                        decodedTx = {
                            data: rlpTx[5],
                            to: rlpTx[3]
                        };
                        provideForContract = function (address) { return __awaiter(_this, void 0, void 0, function () {
                            var erc20Info;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        erc20Info = erc20_1.byContractAddress(address);
                                        if (!erc20Info) return [3 /*break*/, 2];
                                        logs_1.log("ethereum", "loading erc20token info for " +
                                            erc20Info.contractAddress +
                                            " (" +
                                            erc20Info.ticker +
                                            ")");
                                        return [4 /*yield*/, provideERC20TokenInformation(this.transport, erc20Info.data)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); };
                        if (!(decodedTx.data.length >= 10)) return [3 /*break*/, 10];
                        selector = decodedTx.data.substring(0, 10);
                        infos = contracts_1.getInfosForContractMethod(decodedTx.to, selector);
                        if (!infos) return [3 /*break*/, 7];
                        plugin = infos.plugin, payload = infos.payload, signature = infos.signature, erc20OfInterest = infos.erc20OfInterest, abi = infos.abi;
                        if (!plugin) return [3 /*break*/, 2];
                        logs_1.log("ethereum", "loading plugin for " + selector);
                        return [4 /*yield*/, setExternalPlugin(this.transport, payload, signature)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(erc20OfInterest && erc20OfInterest.length && abi)) return [3 /*break*/, 6];
                        contract = new ethers_1.ethers.utils.Interface(abi);
                        args = contract.parseTransaction(decodedTx).args;
                        _i = 0, erc20OfInterest_1 = erc20OfInterest;
                        _a.label = 3;
                    case 3:
                        if (!(_i < erc20OfInterest_1.length)) return [3 /*break*/, 6];
                        path = erc20OfInterest_1[_i];
                        address = path.split(".").reduce(function (value, seg) {
                            if (seg === "-1" && Array.isArray(value)) {
                                return value[value.length - 1];
                            }
                            return value[seg];
                        }, args);
                        return [4 /*yield*/, provideForContract(address)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        logs_1.log("ethereum", "no infos for selector " + selector);
                        _a.label = 8;
                    case 8: return [4 /*yield*/, provideForContract(decodedTx.to)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [2 /*return*/, utils_1.foreach(toSend, function (data, i) {
                            return _this.transport
                                .send(0xe0, 0x04, i === 0 ? 0x00 : 0x80, 0x00, data)
                                .then(function (apduResponse) {
                                response = apduResponse;
                            });
                        }).then(function () {
                            var v = chainIdPrefix + response.slice(0, 1).toString("hex");
                            var r = response.slice(1, 1 + 32).toString("hex");
                            var s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
                            return {
                                v: v,
                                r: r,
                                s: s
                            };
                        }, function (e) {
                            throw remapTransactionRelatedErrors(e);
                        })];
                }
            });
        });
    };
    /**
     */
    Eth.prototype.getAppConfiguration = function () {
        return this.transport.send(0xe0, 0x06, 0x00, 0x00).then(function (response) {
            return {
                arbitraryDataEnabled: response[0] & 0x01,
                erc20ProvisioningNecessary: response[0] & 0x02,
                starkEnabled: response[0] & 0x04,
                starkv2Supported: response[0] & 0x08,
                version: "" + response[1] + "." + response[2] + "." + response[3]
            };
        });
    };
    /**
    * You can sign a message according to eth_sign RPC call and retrieve v, r, s given the message and the BIP 32 path of the account to sign.
    * @example
    eth.signPersonalMessage("44'/60'/0'/0/0", Buffer.from("test").toString("hex")).then(result => {
    var v = result['v'] - 27;
    v = v.toString(16);
    if (v.length < 2) {
      v = "0" + v;
    }
    console.log("Signature 0x" + result['r'] + result['s'] + v);
    })
     */
    Eth.prototype.signPersonalMessage = function (path, messageHex) {
        var _this = this;
        var paths = utils_1.splitPath(path);
        var offset = 0;
        var message = Buffer.from(messageHex, "hex");
        var toSend = [];
        var response;
        var _loop_2 = function () {
            var maxChunkSize = offset === 0 ? 150 - 1 - paths.length * 4 - 4 : 150;
            var chunkSize = offset + maxChunkSize > message.length
                ? message.length - offset
                : maxChunkSize;
            var buffer = Buffer.alloc(offset === 0 ? 1 + paths.length * 4 + 4 + chunkSize : chunkSize);
            if (offset === 0) {
                buffer[0] = paths.length;
                paths.forEach(function (element, index) {
                    buffer.writeUInt32BE(element, 1 + 4 * index);
                });
                buffer.writeUInt32BE(message.length, 1 + 4 * paths.length);
                message.copy(buffer, 1 + 4 * paths.length + 4, offset, offset + chunkSize);
            }
            else {
                message.copy(buffer, 0, offset, offset + chunkSize);
            }
            toSend.push(buffer);
            offset += chunkSize;
        };
        while (offset !== message.length) {
            _loop_2();
        }
        return utils_1.foreach(toSend, function (data, i) {
            return _this.transport
                .send(0xe0, 0x08, i === 0 ? 0x00 : 0x80, 0x00, data)
                .then(function (apduResponse) {
                response = apduResponse;
            });
        }).then(function () {
            var v = response[0];
            var r = response.slice(1, 1 + 32).toString("hex");
            var s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
            return {
                v: v,
                r: r,
                s: s
            };
        });
    };
    /**
    * Sign a prepared message following web3.eth.signTypedData specification. The host computes the domain separator and hashStruct(message)
    * @example
    eth.signEIP712HashedMessage("44'/60'/0'/0/0", Buffer.from("0101010101010101010101010101010101010101010101010101010101010101").toString("hex"), Buffer.from("0202020202020202020202020202020202020202020202020202020202020202").toString("hex")).then(result => {
    var v = result['v'] - 27;
    v = v.toString(16);
    if (v.length < 2) {
      v = "0" + v;
    }
    console.log("Signature 0x" + result['r'] + result['s'] + v);
    })
     */
    Eth.prototype.signEIP712HashedMessage = function (path, domainSeparatorHex, hashStructMessageHex) {
        var domainSeparator = hexBuffer(domainSeparatorHex);
        var hashStruct = hexBuffer(hashStructMessageHex);
        var paths = utils_1.splitPath(path);
        var buffer = Buffer.alloc(1 + paths.length * 4 + 32 + 32, 0);
        var offset = 0;
        buffer[0] = paths.length;
        paths.forEach(function (element, index) {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        offset = 1 + 4 * paths.length;
        domainSeparator.copy(buffer, offset);
        offset += 32;
        hashStruct.copy(buffer, offset);
        return this.transport
            .send(0xe0, 0x0c, 0x00, 0x00, buffer)
            .then(function (response) {
            var v = response[0];
            var r = response.slice(1, 1 + 32).toString("hex");
            var s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
            return {
                v: v,
                r: r,
                s: s
            };
        });
    };
    /**
     * get Stark public key for a given BIP 32 path.
     * @param path a path in BIP 32 format
     * @option boolDisplay optionally enable or not the display
     * @return the Stark public key
     */
    Eth.prototype.starkGetPublicKey = function (path, boolDisplay) {
        var paths = utils_1.splitPath(path);
        var buffer = Buffer.alloc(1 + paths.length * 4);
        buffer[0] = paths.length;
        paths.forEach(function (element, index) {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        return this.transport
            .send(0xf0, 0x02, boolDisplay ? 0x01 : 0x00, 0x00, buffer)
            .then(function (response) {
            return response.slice(0, response.length - 2);
        });
    };
    /**
     * sign a Stark order
     * @param path a path in BIP 32 format
     * @option sourceTokenAddress contract address of the source token (not present for ETH)
     * @param sourceQuantization quantization used for the source token
     * @option destinationTokenAddress contract address of the destination token (not present for ETH)
     * @param destinationQuantization quantization used for the destination token
     * @param sourceVault ID of the source vault
     * @param destinationVault ID of the destination vault
     * @param amountSell amount to sell
     * @param amountBuy amount to buy
     * @param nonce transaction nonce
     * @param timestamp transaction validity timestamp
     * @return the signature
     */
    Eth.prototype.starkSignOrder = function (path, sourceTokenAddress, sourceQuantization, destinationTokenAddress, destinationQuantization, sourceVault, destinationVault, amountSell, amountBuy, nonce, timestamp) {
        var sourceTokenAddressHex = maybeHexBuffer(sourceTokenAddress);
        var destinationTokenAddressHex = maybeHexBuffer(destinationTokenAddress);
        var paths = utils_1.splitPath(path);
        var buffer = Buffer.alloc(1 + paths.length * 4 + 20 + 32 + 20 + 32 + 4 + 4 + 8 + 8 + 4 + 4, 0);
        var offset = 0;
        buffer[0] = paths.length;
        paths.forEach(function (element, index) {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        offset = 1 + 4 * paths.length;
        if (sourceTokenAddressHex) {
            sourceTokenAddressHex.copy(buffer, offset);
        }
        offset += 20;
        Buffer.from(sourceQuantization.toString(16).padStart(64, "0"), "hex").copy(buffer, offset);
        offset += 32;
        if (destinationTokenAddressHex) {
            destinationTokenAddressHex.copy(buffer, offset);
        }
        offset += 20;
        Buffer.from(destinationQuantization.toString(16).padStart(64, "0"), "hex").copy(buffer, offset);
        offset += 32;
        buffer.writeUInt32BE(sourceVault, offset);
        offset += 4;
        buffer.writeUInt32BE(destinationVault, offset);
        offset += 4;
        Buffer.from(amountSell.toString(16).padStart(16, "0"), "hex").copy(buffer, offset);
        offset += 8;
        Buffer.from(amountBuy.toString(16).padStart(16, "0"), "hex").copy(buffer, offset);
        offset += 8;
        buffer.writeUInt32BE(nonce, offset);
        offset += 4;
        buffer.writeUInt32BE(timestamp, offset);
        return this.transport
            .send(0xf0, 0x04, 0x01, 0x00, buffer)
            .then(function (response) {
            var r = response.slice(1, 1 + 32).toString("hex");
            var s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
            return {
                r: r,
                s: s
            };
        });
    };
    /**
     * sign a Stark order using the Starkex V2 protocol
     * @param path a path in BIP 32 format
     * @option sourceTokenAddress contract address of the source token (not present for ETH)
     * @param sourceQuantizationType quantization type used for the source token
     * @option sourceQuantization quantization used for the source token (not present for erc 721 or mintable erc 721)
     * @option sourceMintableBlobOrTokenId mintable blob (mintable erc 20 / mintable erc 721) or token id (erc 721) associated to the source token
     * @option destinationTokenAddress contract address of the destination token (not present for ETH)
     * @param destinationQuantizationType quantization type used for the destination token
     * @option destinationQuantization quantization used for the destination token (not present for erc 721 or mintable erc 721)
     * @option destinationMintableBlobOrTokenId mintable blob (mintable erc 20 / mintable erc 721) or token id (erc 721) associated to the destination token
     * @param sourceVault ID of the source vault
     * @param destinationVault ID of the destination vault
     * @param amountSell amount to sell
     * @param amountBuy amount to buy
     * @param nonce transaction nonce
     * @param timestamp transaction validity timestamp
     * @return the signature
     */
    Eth.prototype.starkSignOrder_v2 = function (path, sourceTokenAddress, sourceQuantizationType, sourceQuantization, sourceMintableBlobOrTokenId, destinationTokenAddress, destinationQuantizationType, destinationQuantization, destinationMintableBlobOrTokenId, sourceVault, destinationVault, amountSell, amountBuy, nonce, timestamp) {
        var sourceTokenAddressHex = maybeHexBuffer(sourceTokenAddress);
        var destinationTokenAddressHex = maybeHexBuffer(destinationTokenAddress);
        if (!(sourceQuantizationType in starkQuantizationTypeMap)) {
            throw new Error("eth.starkSignOrderv2 invalid source quantization type=" +
                sourceQuantizationType);
        }
        if (!(destinationQuantizationType in starkQuantizationTypeMap)) {
            throw new Error("eth.starkSignOrderv2 invalid destination quantization type=" +
                destinationQuantizationType);
        }
        var paths = utils_1.splitPath(path);
        var buffer = Buffer.alloc(1 +
            paths.length * 4 +
            1 +
            20 +
            32 +
            32 +
            1 +
            20 +
            32 +
            32 +
            4 +
            4 +
            8 +
            8 +
            4 +
            4, 0);
        var offset = 0;
        buffer[0] = paths.length;
        paths.forEach(function (element, index) {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        offset = 1 + 4 * paths.length;
        buffer[offset] = starkQuantizationTypeMap[sourceQuantizationType];
        offset++;
        if (sourceTokenAddressHex) {
            sourceTokenAddressHex.copy(buffer, offset);
        }
        offset += 20;
        if (sourceQuantization) {
            Buffer.from(sourceQuantization.toString(16).padStart(64, "0"), "hex").copy(buffer, offset);
        }
        offset += 32;
        if (sourceMintableBlobOrTokenId) {
            Buffer.from(sourceMintableBlobOrTokenId.toString(16).padStart(64, "0"), "hex").copy(buffer, offset);
        }
        offset += 32;
        buffer[offset] = starkQuantizationTypeMap[destinationQuantizationType];
        offset++;
        if (destinationTokenAddressHex) {
            destinationTokenAddressHex.copy(buffer, offset);
        }
        offset += 20;
        if (destinationQuantization) {
            Buffer.from(destinationQuantization.toString(16).padStart(64, "0"), "hex").copy(buffer, offset);
        }
        offset += 32;
        if (destinationMintableBlobOrTokenId) {
            Buffer.from(destinationMintableBlobOrTokenId.toString(16).padStart(64, "0"), "hex").copy(buffer, offset);
        }
        offset += 32;
        buffer.writeUInt32BE(sourceVault, offset);
        offset += 4;
        buffer.writeUInt32BE(destinationVault, offset);
        offset += 4;
        Buffer.from(amountSell.toString(16).padStart(16, "0"), "hex").copy(buffer, offset);
        offset += 8;
        Buffer.from(amountBuy.toString(16).padStart(16, "0"), "hex").copy(buffer, offset);
        offset += 8;
        buffer.writeUInt32BE(nonce, offset);
        offset += 4;
        buffer.writeUInt32BE(timestamp, offset);
        return this.transport
            .send(0xf0, 0x04, 0x03, 0x00, buffer)
            .then(function (response) {
            var r = response.slice(1, 1 + 32).toString("hex");
            var s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
            return {
                r: r,
                s: s
            };
        });
    };
    /**
     * sign a Stark transfer
     * @param path a path in BIP 32 format
     * @option transferTokenAddress contract address of the token to be transferred (not present for ETH)
     * @param transferQuantization quantization used for the token to be transferred
     * @param targetPublicKey target Stark public key
     * @param sourceVault ID of the source vault
     * @param destinationVault ID of the destination vault
     * @param amountTransfer amount to transfer
     * @param nonce transaction nonce
     * @param timestamp transaction validity timestamp
     * @return the signature
     */
    Eth.prototype.starkSignTransfer = function (path, transferTokenAddress, transferQuantization, targetPublicKey, sourceVault, destinationVault, amountTransfer, nonce, timestamp) {
        var transferTokenAddressHex = maybeHexBuffer(transferTokenAddress);
        var targetPublicKeyHex = hexBuffer(targetPublicKey);
        var paths = utils_1.splitPath(path);
        var buffer = Buffer.alloc(1 + paths.length * 4 + 20 + 32 + 32 + 4 + 4 + 8 + 4 + 4, 0);
        var offset = 0;
        buffer[0] = paths.length;
        paths.forEach(function (element, index) {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        offset = 1 + 4 * paths.length;
        if (transferTokenAddressHex) {
            transferTokenAddressHex.copy(buffer, offset);
        }
        offset += 20;
        Buffer.from(transferQuantization.toString(16).padStart(64, "0"), "hex").copy(buffer, offset);
        offset += 32;
        targetPublicKeyHex.copy(buffer, offset);
        offset += 32;
        buffer.writeUInt32BE(sourceVault, offset);
        offset += 4;
        buffer.writeUInt32BE(destinationVault, offset);
        offset += 4;
        Buffer.from(amountTransfer.toString(16).padStart(16, "0"), "hex").copy(buffer, offset);
        offset += 8;
        buffer.writeUInt32BE(nonce, offset);
        offset += 4;
        buffer.writeUInt32BE(timestamp, offset);
        return this.transport
            .send(0xf0, 0x04, 0x02, 0x00, buffer)
            .then(function (response) {
            var r = response.slice(1, 1 + 32).toString("hex");
            var s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
            return {
                r: r,
                s: s
            };
        });
    };
    /**
     * sign a Stark transfer or conditional transfer using the Starkex V2 protocol
     * @param path a path in BIP 32 format
     * @option transferTokenAddress contract address of the token to be transferred (not present for ETH)
     * @param transferQuantizationType quantization type used for the token to be transferred
     * @option transferQuantization quantization used for the token to be transferred (not present for erc 721 or mintable erc 721)
     * @option transferMintableBlobOrTokenId mintable blob (mintable erc 20 / mintable erc 721) or token id (erc 721) associated to the token to be transferred
     * @param targetPublicKey target Stark public key
     * @param sourceVault ID of the source vault
     * @param destinationVault ID of the destination vault
     * @param amountTransfer amount to transfer
     * @param nonce transaction nonce
     * @param timestamp transaction validity timestamp
     * @option conditionalTransferAddress onchain address of the condition for a conditional transfer
     * @option conditionalTransferFact fact associated to the condition for a conditional transfer
     * @return the signature
     */
    Eth.prototype.starkSignTransfer_v2 = function (path, transferTokenAddress, transferQuantizationType, transferQuantization, transferMintableBlobOrTokenId, targetPublicKey, sourceVault, destinationVault, amountTransfer, nonce, timestamp, conditionalTransferAddress, conditionalTransferFact) {
        var transferTokenAddressHex = maybeHexBuffer(transferTokenAddress);
        var targetPublicKeyHex = hexBuffer(targetPublicKey);
        var conditionalTransferAddressHex = maybeHexBuffer(conditionalTransferAddress);
        if (!(transferQuantizationType in starkQuantizationTypeMap)) {
            throw new Error("eth.starkSignTransferv2 invalid quantization type=" +
                transferQuantizationType);
        }
        var paths = utils_1.splitPath(path);
        var buffer = Buffer.alloc(1 +
            paths.length * 4 +
            1 +
            20 +
            32 +
            32 +
            32 +
            4 +
            4 +
            8 +
            4 +
            4 +
            (conditionalTransferAddressHex ? 32 + 20 : 0), 0);
        var offset = 0;
        buffer[0] = paths.length;
        paths.forEach(function (element, index) {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        offset = 1 + 4 * paths.length;
        buffer[offset] = starkQuantizationTypeMap[transferQuantizationType];
        offset++;
        if (transferTokenAddressHex) {
            transferTokenAddressHex.copy(buffer, offset);
        }
        offset += 20;
        if (transferQuantization) {
            Buffer.from(transferQuantization.toString(16).padStart(64, "0"), "hex").copy(buffer, offset);
        }
        offset += 32;
        if (transferMintableBlobOrTokenId) {
            Buffer.from(transferMintableBlobOrTokenId.toString(16).padStart(64, "0"), "hex").copy(buffer, offset);
        }
        offset += 32;
        targetPublicKeyHex.copy(buffer, offset);
        offset += 32;
        buffer.writeUInt32BE(sourceVault, offset);
        offset += 4;
        buffer.writeUInt32BE(destinationVault, offset);
        offset += 4;
        Buffer.from(amountTransfer.toString(16).padStart(16, "0"), "hex").copy(buffer, offset);
        offset += 8;
        buffer.writeUInt32BE(nonce, offset);
        offset += 4;
        buffer.writeUInt32BE(timestamp, offset);
        if (conditionalTransferAddressHex && conditionalTransferFact) {
            offset += 4;
            Buffer.from(conditionalTransferFact.toString(16).padStart(64, "0"), "hex").copy(buffer, offset);
            offset += 32;
            conditionalTransferAddressHex.copy(buffer, offset);
        }
        return this.transport
            .send(0xf0, 0x04, conditionalTransferAddressHex ? 0x05 : 0x04, 0x00, buffer)
            .then(function (response) {
            var r = response.slice(1, 1 + 32).toString("hex");
            var s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
            return {
                r: r,
                s: s
            };
        });
    };
    /**
     * provide quantization information before singing a deposit or withdrawal Stark powered contract call
     *
     * It shall be run following a provideERC20TokenInformation call for the given contract
     *
     * @param operationContract contract address of the token to be transferred (not present for ETH)
     * @param operationQuantization quantization used for the token to be transferred
     */
    Eth.prototype.starkProvideQuantum = function (operationContract, operationQuantization) {
        var operationContractHex = maybeHexBuffer(operationContract);
        var buffer = Buffer.alloc(20 + 32, 0);
        if (operationContractHex) {
            operationContractHex.copy(buffer, 0);
        }
        Buffer.from(operationQuantization.toString(16).padStart(64, "0"), "hex").copy(buffer, 20);
        return this.transport.send(0xf0, 0x08, 0x00, 0x00, buffer).then(function () { return true; }, function (e) {
            if (e && e.statusCode === 0x6d00) {
                // this case happen for ETH application versions not supporting Stark extensions
                return false;
            }
            throw e;
        });
    };
    /**
     * provide quantization information before singing a deposit or withdrawal Stark powered contract call using the Starkex V2 protocol
     *
     * It shall be run following a provideERC20TokenInformation call for the given contract
     *
     * @param operationContract contract address of the token to be transferred (not present for ETH)
     * @param operationQuantizationType quantization type of the token to be transferred
     * @option operationQuantization quantization used for the token to be transferred (not present for erc 721 or mintable erc 721)
     * @option operationMintableBlobOrTokenId mintable blob (mintable erc 20 / mintable erc 721) or token id (erc 721) of the token to be transferred
     */
    Eth.prototype.starkProvideQuantum_v2 = function (operationContract, operationQuantizationType, operationQuantization, operationMintableBlobOrTokenId) {
        var operationContractHex = maybeHexBuffer(operationContract);
        if (!(operationQuantizationType in starkQuantizationTypeMap)) {
            throw new Error("eth.starkProvideQuantumV2 invalid quantization type=" +
                operationQuantizationType);
        }
        var buffer = Buffer.alloc(20 + 32 + 32, 0);
        var offset = 0;
        if (operationContractHex) {
            operationContractHex.copy(buffer, offset);
        }
        offset += 20;
        if (operationQuantization) {
            Buffer.from(operationQuantization.toString(16).padStart(64, "0"), "hex").copy(buffer, offset);
        }
        offset += 32;
        if (operationMintableBlobOrTokenId) {
            Buffer.from(operationMintableBlobOrTokenId.toString(16).padStart(64, "0"), "hex").copy(buffer, offset);
        }
        return this.transport
            .send(0xf0, 0x08, starkQuantizationTypeMap[operationQuantizationType], 0x00, buffer)
            .then(function () { return true; }, function (e) {
            if (e && e.statusCode === 0x6d00) {
                // this case happen for ETH application versions not supporting Stark extensions
                return false;
            }
            throw e;
        });
    };
    /**
     * sign the given hash over the Stark curve
     * It is intended for speed of execution in case an unknown Stark model is pushed and should be avoided as much as possible.
     * @param path a path in BIP 32 format
     * @param hash hexadecimal hash to sign
     * @return the signature
     */
    Eth.prototype.starkUnsafeSign = function (path, hash) {
        var hashHex = hexBuffer(hash);
        var paths = utils_1.splitPath(path);
        var buffer = Buffer.alloc(1 + paths.length * 4 + 32);
        var offset = 0;
        buffer[0] = paths.length;
        paths.forEach(function (element, index) {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        offset = 1 + 4 * paths.length;
        hashHex.copy(buffer, offset);
        return this.transport
            .send(0xf0, 0x0a, 0x00, 0x00, buffer)
            .then(function (response) {
            var r = response.slice(1, 1 + 32).toString("hex");
            var s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
            return {
                r: r,
                s: s
            };
        });
    };
    /**
     * get an Ethereum 2 BLS-12 381 public key for a given BIP 32 path.
     * @param path a path in BIP 32 format
     * @option boolDisplay optionally enable or not the display
     * @return an object with a publicKey
     * @example
     * eth.eth2GetPublicKey("12381/3600/0/0").then(o => o.publicKey)
     */
    Eth.prototype.eth2GetPublicKey = function (path, boolDisplay) {
        var paths = utils_1.splitPath(path);
        var buffer = Buffer.alloc(1 + paths.length * 4);
        buffer[0] = paths.length;
        paths.forEach(function (element, index) {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        return this.transport
            .send(0xe0, 0x0e, boolDisplay ? 0x01 : 0x00, 0x00, buffer)
            .then(function (response) {
            return {
                publicKey: response.slice(0, -2).toString("hex")
            };
        });
    };
    /**
     * Set the index of a Withdrawal key used as withdrawal credentials in an ETH 2 deposit contract call signature
     *
     * It shall be run before the ETH 2 deposit transaction is signed. If not called, the index is set to 0
     *
     * @param withdrawalIndex index path in the EIP 2334 path m/12381/3600/withdrawalIndex/0
     * @return True if the method was executed successfully
     */
    Eth.prototype.eth2SetWithdrawalIndex = function (withdrawalIndex) {
        var buffer = Buffer.alloc(4, 0);
        buffer.writeUInt32BE(withdrawalIndex, 0);
        return this.transport.send(0xe0, 0x10, 0x00, 0x00, buffer).then(function () { return true; }, function (e) {
            if (e && e.statusCode === 0x6d00) {
                // this case happen for ETH application versions not supporting ETH 2
                return false;
            }
            throw e;
        });
    };
    /**
     * Set the name of the plugin that should be used to parse the next transaction
     *
     * @param pluginName string containing the name of the plugin, must have length between 1 and 30 bytes
     * @return True if the method was executed successfully
     */
    Eth.prototype.setExternalPlugin = function (pluginName, contractAddress, selector) {
        return setExternalPlugin(this.transport, pluginName, selector);
    };
    return Eth;
}());
exports["default"] = Eth;
// internal helpers
function provideERC20TokenInformation(transport, data) {
    return transport.send(0xe0, 0x0a, 0x00, 0x00, data).then(function () { return true; }, function (e) {
        if (e && e.statusCode === 0x6d00) {
            // this case happen for older version of ETH app, since older app version had the ERC20 data hardcoded, it's fine to assume it worked.
            // we return a flag to know if the call was effective or not
            return false;
        }
        throw e;
    });
}
function setExternalPlugin(transport, payload, signature) {
    var payloadBuffer = Buffer.from(payload, "hex");
    var signatureBuffer = Buffer.from(signature, "hex");
    var buffer = Buffer.concat([payloadBuffer, signatureBuffer]);
    return transport.send(0xe0, 0x12, 0x00, 0x00, buffer).then(function () { return true; }, function (e) {
        if (e && e.statusCode === 0x6a80) {
            // this case happen when the plugin name is too short or too long
            return false;
        }
        else if (e && e.statusCode === 0x6984) {
            // this case happen when the plugin requested is not installed on the device
            return false;
        }
        else if (e && e.statusCode === 0x6d00) {
            // this case happen for older version of ETH app
            return false;
        }
        throw e;
    });
}
