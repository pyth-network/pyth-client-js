# Changelog

### 2.5.1

### Changed

Improved error message when passing an invalid cluster name to `pythProgramKeyForCluster`

### 2.5.0

### Changed

Restructure `drv2` field in `PriceData` to `minPublishers` and other future drv values

### 2.4.0

### Changed

Product only define `price` and `confidence` fields if it currently has a valid price

### Fixed

Memory leak in an underlying library

### 2.3.2

### Added

PythConnection 

## 2.2.0

### Added

numQuoters

## 2.1.0

### Added

Support new twap and twac

## 2.0.1

### Added

Types

## 2.0.0

### Added

Support for v2 account structure

### Removed

Support for v1 account structure

## 1.0.7

### Changed

allow nextPriceAccountKey to be null

## 1.0.6

### Changed

Updated README.md

## 1.0.5

### Fixed

Respect size when parsing product metadata

## 1.0.4

### Fixed

Gatsby support

## 1.0.3

### Fixed

Do not rely on Buffer's readBig(U)Int64LE

## 1.0.2

### Changed

Repository url

## 1.0.1

### Fixed

Parse price as Big*Int*64

## 1.0.0

Initial release
