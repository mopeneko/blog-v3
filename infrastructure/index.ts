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

const prodNatGateway = new oci.core.NatGateway('prod-nat-gateway', {
  compartmentId: prodCompartment.id,
  vcnId: prodVcn.id,
  displayName: 'prod-nat-gateway',
});

const allService = oci.core.getServicesOutput().apply((result) => {
  return result.services.find((service) => service.name.startsWith('All '));
});

const prodServiceGateway = new oci.core.ServiceGateway('prod-sgw', {
  compartmentId: prodCompartment.id,
  vcnId: prodVcn.id,
  services: allService.apply((result) => {
    return result?.id ? [{ serviceId: result.id }] : [];
  }),
  displayName: 'prod-sgw',
});

const prodDynamicRoutingGateway = new oci.core.Drg('prod-drg', {
  compartmentId: prodCompartment.id,
  displayName: 'prod-drg',
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

const prodRouteTablePrivate = new oci.core.RouteTable('prod-rtb-private', {
  compartmentId: prodCompartment.id,
  vcnId: prodVcn.id,
  displayName: 'prod-rtb-private',
  routeRules: [
    {
      networkEntityId: prodNatGateway.id,
      destination: '0.0.0.0/0',
      destinationType: 'CIDR_BLOCK',
    },
    {
      networkEntityId: prodServiceGateway.id,
      destination: allService.apply((result) => {
        return result?.cidrBlock || '';
      }),
      destinationType: 'SERVICE_CIDR_BLOCK',
    },
    {
      networkEntityId: prodDynamicRoutingGateway.id,
      destination: '10.0.0.0/16',
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

const prodSecurityListPrivate = new oci.core.SecurityList('prod-sls-private', {
  compartmentId: prodCompartment.id,
  vcnId: prodVcn.id,
  displayName: 'prod-sls-private',
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
      source: '10.0.0.0/16',
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
      source: '10.0.0.0/16',
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
  routeTableId: prodRouteTablePrivate.id,
  securityListIds: [prodSecurityListPrivate.id],
});

const containerRepository = new oci.artifacts.ContainerRepository('mope-blog-repo/mope-blog', {
  compartmentId: prodCompartment.id,
  displayName: 'mope-blog-repo/mope-blog',
  isImmutable: false,
  isPublic: false,
});

const availabilityDomains = oci.identity.getAvailabilityDomainsOutput({
  compartmentId: prodCompartment.id,
});

export const availabilityDomain = availabilityDomains.availabilityDomains.apply((result) => {
  return result[0].name;
});

const containerNsg = new oci.core.NetworkSecurityGroup('container-nsg', {
  compartmentId: prodCompartment.id,
  vcnId: prodVcn.id,
  displayName: 'container-nsg',
});

// Allow all egress
const _nsgEgressRule = new oci.core.NetworkSecurityGroupSecurityRule('container-nsg-egress', {
  networkSecurityGroupId: containerNsg.id,
  direction: 'EGRESS',
  protocol: 'all',
  destination: '0.0.0.0/0',
  destinationType: 'CIDR_BLOCK',
  stateless: false,
});

// Allow ingress on port 80 for your app
const _nsgIngressRule = new oci.core.NetworkSecurityGroupSecurityRule(
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

const containerInstance = new oci.containerengine.ContainerInstance('mope-blog', {
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
      username: Buffer.from(config.require('pullerUsername')).toString('base64'),
      password: Buffer.from(config.require('pullerPassword')).toString('base64'),
    },
  ],
  shape: 'CI.Standard.E4.Flex',
  shapeConfig: {
    ocpus: 1,
    memoryInGbs: 1,
  },
  vnics: [
    {
      subnetId: prodPrivateSubnet.id,
      nsgIds: [containerNsg.id],
      isPublicIpAssigned: false,
    },
  ],
  displayName: 'mope-blog',
});

export const containerInstanceID = containerInstance.id;

const nlb = new oci.networkloadbalancer.NetworkLoadBalancer('mope-blog-nlb', {
  compartmentId: prodCompartment.id,
  displayName: 'mope-blog-nlb',
  subnetId: prodPublicSubnet.id,
  isPrivate: false,
});

const nlbBackendSet = new oci.networkloadbalancer.BackendSet('mope-blog-nlb-backend-set', {
  name: 'mope-blog-nlb-backend-set',
  networkLoadBalancerId: nlb.id,
  healthChecker: {
    protocol: 'HTTP',
    port: 80,
    returnCode: 200,
    urlPath: '/health',
  },
  policy: 'FIVE_TUPLE',
});

const _nlbBackend = new oci.networkloadbalancer.Backend('mope-blog-nlb-backend', {
  name: 'mope-blog-nlb-backend',
  networkLoadBalancerId: nlb.id,
  backendSetName: nlbBackendSet.name,
  ipAddress: containerInstance.vnics[0].privateIp,
  port: 80,
  weight: 1,
});

const _nlbListener = new oci.networkloadbalancer.Listener('mope-blog-nlb-listener', {
  name: 'mope-blog-nlb-listener',
  networkLoadBalancerId: nlb.id,
  port: 80,
  protocol: 'TCP',
  defaultBackendSetName: nlbBackendSet.name,
});
