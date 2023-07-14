import RootAppCard from "@/components/rootAppCard";

export default function EnergyBillsIndex() {

  return (
    <>
    <div className="columns">
      <div className="column">
        <RootAppCard link={{ url: "/energy/bills/add", newTab: false }} title={"Add bill"} />
      </div>
      <div className="column">
        <RootAppCard link={{ url: "/energy/bills/history", newTab: false }} title={"View history"} />
      </div>
    </div>

    <div className="columns">
      
    </div>
    </>
  )
}