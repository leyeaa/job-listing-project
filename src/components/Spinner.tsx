import { CSSProperties } from "react";
import ClipLoader from "react-spinners/ClipLoader";

const override: CSSProperties = {
  display: "block",
  margin: "100px auto",
};
interface Props {
  loading: boolean;
}
const Spinner = ({ loading }: Props) => {
  return (
    <ClipLoader
      color="#4338ca"
      loading={loading}
      cssOverride={override}
      size={150}
    />
  );
};

export default Spinner;
