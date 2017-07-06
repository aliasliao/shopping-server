# DROP TABLE IF EXISTS `order`;
# DROP TABLE IF EXISTS `goods`;
# DROP TABLE IF EXISTS `consumer`;
# DROP TABLE IF EXISTS `merchant`;
# DROP TABLE IF EXISTS `news`;


CREATE TABLE IF NOT EXISTS `consumer` (
  id          VARCHAR(8) NOT NULL,  -- by order
  name        VARCHAR(64) NOT NULL,
  password    VARCHAR(32) NOT NULL,
  money       FLOAT NOT NULL DEFAULT '5000',
  address      VARCHAR(256) NOT NULL,
  freeLimit   FLOAT NOT NULL DEFAULT '100',

  CONSTRAINT consumer_pk PRIMARY KEY (id)

) ENGINE=InnoDB, DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `merchant` (
  id          VARCHAR(8) NOT NULL,  -- by goods, order
  name        VARCHAR(64) NOT NULL,
  password    VARCHAR(32) NOT NULL,
  money       FLOAT NOT NULL DEFAULT '500000',

  CONSTRAINT merchant_pk PRIMARY KEY (id)

) ENGINE=InnoDB, DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `goods` (
  id          VARCHAR(8) NOT NULL,  -- by order
  merchantId  VARCHAR(8) NOT NULL,
  name        VARCHAR(64) NOT NULL,
  price       FLOAT NOT NULL,
  imageUrl    VARCHAR(256),

  CONSTRAINT goods_pk PRIMARY KEY (id),
  CONSTRAINT merchant_fk FOREIGN KEY (merchantId) REFERENCES merchant (id)

) ENGINE=InnoDB, DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `order` (
  id          VARCHAR(8) NOT NULL,
  consumerId  VARCHAR(8) NOT NULL,
  merchantId  VARCHAR(8) NOT NULL,
  goodsId     VARCHAR(8) NOT NULL,
  time        DATETIME NOT NULL,
  state       VARCHAR(64) NOT NULL,


  CONSTRAINT order_pk PRIMARY KEY (id),
  CONSTRAINT consumer_pk FOREIGN KEY (consumerId) REFERENCES consumer (id),
  CONSTRAINT merchant_pk FOREIGN KEY (merchantId) REFERENCES merchant (id),
  CONSTRAINT goods_pk FOREIGN KEY (goodsId) REFERENCES goods (id)

) ENGINE=InnoDB, DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `news` (
  id          VARCHAR(8) NOT NULL,
  title       VARCHAR(64) NOT NULL,
  abstract    VARCHAR(128) NOT NULL,
  contentUrl  VARCHAR(256) NOT NULL,
  imageUrl    VARCHAR(256),

  CONSTRAINT news_pk PRIMARY KEY (id)

) ENGINE=InnoDB, DEFAULT CHARSET=utf8;
