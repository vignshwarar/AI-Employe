const isDeploymentTypeOpenSource = () => {
  return process.env.DEPLOYMENT_TYPE === "open-source";
};

export default isDeploymentTypeOpenSource;
