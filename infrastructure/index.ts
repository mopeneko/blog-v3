import * as pulumi from '@pulumi/pulumi';
import * as oci from '@pulumi/oci';

const config = new pulumi.Config();
const ociConfig = new pulumi.Config('oci');

const prodCompartment = new oci.identity.Compartment('prod', {
  name: 'prod',
  description: 'Production compartment',
  enableDelete: true,
});

const prodVcn = new oci.core.Vcn('prod-vcn', {
  compartmentId: prodCompartment.id,
  cidrBlock: '10.0.0.0/16',
  displayName: 'prod-vcn',
  dnsLabel: 'vcn',
});

const prodInternetGateway = new oci.core.InternetGateway('prod-igw', {
  compartmentId: prodCompartment.id,
  vcnId: prodVcn.id,
  enabled: true,
  displayName: 'prod-igw',
});

const prodRouteTable = new oci.core.RouteTable('prod-rtb', {
  compartmentId: prodCompartment.id,
  vcnId: prodVcn.id,
  displayName: 'prod-rtb',
  routeRules: [
    {
      networkEntityId: prodInternetGateway.id,
      destination: '0.0.0.0/0',
      destinationType: 'CIDR_BLOCK',
    },
  ],
});

const prodSecurityList = new oci.core.SecurityList('prod-sls', {
  compartmentId: prodCompartment.id,
  vcnId: prodVcn.id,
  displayName: 'prod-sls',
  egressSecurityRules: [
    {
      destination: '0.0.0.0/0',
      protocol: 'all',
      destinationType: 'CIDR_BLOCK',
      stateless: false,
    },
  ],
  ingressSecurityRules: [
    {
      protocol: '1',
      source: '0.0.0.0/0',
      description: 'ICMP',
      icmpOptions: {
        type: 3,
        code: 4,
      },
      sourceType: 'CIDR_BLOCK',
      stateless: false,
    },
    {
      protocol: '6',
      source: '0.0.0.0/0',
      description: 'HTTP :80',
      tcpOptions: {
        min: 80,
        max: 80,
      },
      sourceType: 'CIDR_BLOCK',
      stateless: false,
    },
  ],
});

const prodPublicSubnet = new oci.core.Subnet('prod-public-subnet', {
  cidrBlock: '10.0.0.0/24',
  compartmentId: prodCompartment.id,
  vcnId: prodVcn.id,
  displayName: 'prod-public-subnet',
  dnsLabel: 'publicsubnet',
  prohibitInternetIngress: false,
  prohibitPublicIpOnVnic: false,
  routeTableId: prodRouteTable.id,
  securityListIds: [prodSecurityList.id],
});

const prodPrivateSubnet = new oci.core.Subnet('prod-private-subnet', {
  cidrBlock: '10.0.1.0/24',
  compartmentId: prodCompartment.id,
  vcnId: prodVcn.id,
  displayName: 'prod-private-subnet',
  dnsLabel: 'privatesubnet',
  prohibitInternetIngress: true,
  prohibitPublicIpOnVnic: true,
});

const containerRepository = new oci.artifacts.ContainerRepository(
  'mope-blog-repo/mope-blog',
  {
    compartmentId: prodCompartment.id,
    displayName: 'mope-blog-repo/mope-blog',
    isImmutable: false,
    isPublic: false,
  },
);

const availabilityDomains = oci.identity.getAvailabilityDomainsOutput({
  compartmentId: prodCompartment.id,
});

export const availabilityDomain = availabilityDomains.availabilityDomains.apply(
  (result) => {
    return result[0].name;
  },
);

const containerNsg = new oci.core.NetworkSecurityGroup('container-nsg', {
  compartmentId: prodCompartment.id,
  vcnId: prodVcn.id,
  displayName: 'container-nsg',
});

// Allow all egress
const nsgEgressRule = new oci.core.NetworkSecurityGroupSecurityRule(
  'container-nsg-egress',
  {
    networkSecurityGroupId: containerNsg.id,
    direction: 'EGRESS',
    protocol: 'all',
    destination: '0.0.0.0/0',
    destinationType: 'CIDR_BLOCK',
    stateless: false,
  },
);

// Allow ingress on port 80 for your app
const nsgIngressRule = new oci.core.NetworkSecurityGroupSecurityRule(
  'container-nsg-ingress-http',
  {
    networkSecurityGroupId: containerNsg.id,
    direction: 'INGRESS',
    protocol: '6', // TCP
    source: '0.0.0.0/0',
    sourceType: 'CIDR_BLOCK',
    tcpOptions: {
      destinationPortRange: {
        min: 80,
        max: 80,
      },
    },
    stateless: false,
  },
);

const registryEndpoint = `ocir.${ociConfig.require('region')}.oci.oraclecloud.com`;

const containerInstance = new oci.containerengine.ContainerInstance(
  'mope-blog',
  {
    availabilityDomain: availabilityDomain,
    compartmentId: prodCompartment.id,
    containers: [
      {
        imageUrl: pulumi.interpolate`${registryEndpoint}/${containerRepository.namespace}/${containerRepository.displayName}:latest`,
        healthChecks: [
          {
            healthCheckType: 'HTTP',
            path: '/health',
            port: 80,
          },
        ],
        environmentVariables: {
          NEXT_PUBLIC_SITE_URL: config.require('siteUrl'),
          MICROCMS_SERVICE_DOMAIN: config.require('microcmsServiceDomain'),
          MICROCMS_API_KEY: config.require('microcmsApiKey'),
          PORT: '80',
        },
      },
    ],
    imagePullSecrets: [
      {
        secretType: 'BASIC',
        registryEndpoint: registryEndpoint,
        username: Buffer.from(config.require('pullerUsername')).toString(
          'base64',
        ),
        password: Buffer.from(config.require('pullerPassword')).toString(
          'base64',
        ),
      },
    ],
    shape: 'CI.Standard.E4.Flex',
    shapeConfig: {
      ocpus: 1,
      memoryInGbs: 1,
    },
    vnics: [
      {
        subnetId: prodPublicSubnet.id,
        nsgIds: [containerNsg.id],
        isPublicIpAssigned: true,
      },
    ],
    displayName: 'mope-blog',
  },
);

export const containerInstanceID = containerInstance.id;
