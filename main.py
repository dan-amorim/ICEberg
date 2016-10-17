# -*- coding: utf-8 -*-
"""
Created on Sun Oct  9 13:37:11 2016

@author: hemag
"""

import random
import pandas as pd
#import numpy as np
import json
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.ensemble.partial_dependence import plot_partial_dependence
from sklearn.ensemble.partial_dependence import partial_dependence

def create_dataset():
    var_dict = { 
        "ID" : [],
        "X1" : [],
        "X2" : [],
        "X3" : [],
        "Y"  : []
    }
    random.seed(47)
    for i in range(0,1000):
        x1 = random.uniform(0,1)
        x2 = random.uniform(0,1)
        x3 = random.uniform(0,1)
        error = random.gauss(0,1)
        y = 0.2*x1-5*x2+10*x2*(x3 >= 0.5)+error
        var_dict["ID"].append(i)
        var_dict["X1"].append(x1)
        var_dict["X2"].append(x2)
        var_dict["X3"].append(x3)
        var_dict["Y"].append(y)
    return pd.DataFrame.from_dict(var_dict)

    
def ice_json(model,data,varlist,nvalues=20):
    retval = {
        "xvalues" : {},
        "meanseries" : {},
        "series" : []    
    }
    for i in range(0,data.shape[0]):
        retval["series"].append({
            "ID" : i,
            "original" : data.iloc[i].to_dict(),      
            "ICE" : {}          
        })    
    for var in varlist:
        #Calculando o grid de avaliação da função
        q = [x * 1.0/(nvalues-1) for x in range(0,nvalues)]
        qvalues = data[[var]].quantile(q)    
        retval["xvalues"][var] = qvalues[var].unique().tolist()
        #Simulando
        df_copy = data.copy()        
        df_results = pd.DataFrame(index=data.index,columns=retval["xvalues"][var])
        for v in retval["xvalues"][var]:
            df_copy[var] = v
            df_results[v] = model.predict(df_copy) 
        meanr = [0] * len(retval["xvalues"][var])
        for i in range(0,data.shape[0]):
            r = df_results.iloc[i].tolist()
            r = [x - r[0] for x in r]
            retval["series"][i]["ICE"][var] = r
            meanr = [sum(x) for x in zip(r,meanr)]
        retval["meanseries"][var] = [x / data.shape[0] for x in meanr]
        
                
    return retval
        
    

if __name__ == "__main__":
    df = create_dataset()
    x = df[['X1','X2','X3']]
    y = df['Y']
    
    model = GradientBoostingRegressor(max_depth=1)
    model.fit(x,y)
    iret = ice_json(model,x,["X1","X2","X3"])
    with open("data.json","w") as f:
        json.dump(iret,f)
        